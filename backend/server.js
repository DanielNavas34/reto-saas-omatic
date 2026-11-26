const path = require('path');
const express = require('express');
const cors = require('cors');
const { initDatabase, get, run, all } = require('./database/db');
const { fetchRates } = require('./rates');
const { parseCustomerBody, parseSimulationBody, quote } = require('./dist/domain');

const CUSTOMER_COLUMNS = 'id, company_name, tax_id, email, country, plan_type';

function createApp(db, options = {}) {
  const getRates = options.getRates || fetchRates;
  const app = express();

  app.use(cors({ origin: '*' }));
  app.use(express.json());

  app.get('/rates', async (_req, res) => {
    try {
      const rates = await getRates();
      res.json({ EUR: 1, USD: rates.USD, GBP: rates.GBP });
    } catch (err) {
      console.error(err);
      res.status(503).json({ error: 'No se pudieron obtener los tipos de cambio.' });
    }
  });

  app.post('/customers', async (req, res) => {
    const parsed = parseCustomerBody(req.body);
    if (!parsed.ok) {
      res.status(400).json({ error: parsed.error });
      return;
    }

    try {
      const existing = await findCustomerByTaxId(db, parsed.value.tax_id);
      if (existing) {
        res.status(200).json({ message: 'Recuperado', customer: existing });
        return;
      }

      const inserted = await run(
        db,
        `INSERT INTO customers (company_name, tax_id, email, country, plan_type) VALUES (?, ?, ?, ?, ?)`,
        [
          parsed.value.company_name,
          parsed.value.tax_id,
          parsed.value.email,
          parsed.value.country,
          parsed.value.plan_type,
        ],
      );
      const customer = await findCustomerById(db, inserted.lastID);
      res.status(201).json({ message: 'Registrado', customer });
    } catch (err) {
      if (isUniqueViolation(err)) {
        const existing = await findCustomerByTaxId(db, parsed.value.tax_id);
        if (existing) {
          res.status(200).json({ message: 'Recuperado', customer: existing });
          return;
        }
      }
      console.error(err);
      res.status(500).json({ error: 'Error de base de datos.' });
    }
  });

  app.post('/quotes', async (req, res) => {
    try {
      const outcome = await priceSimulation(db, getRates, req.body);
      if (outcome.error) {
        res.status(outcome.status).json({ error: outcome.error });
        return;
      }
      res.json(outcome.body);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error de base de datos.' });
    }
  });

  app.post('/simulations', async (req, res) => {
    try {
      const outcome = await priceSimulation(db, getRates, req.body);
      if (outcome.error) {
        res.status(outcome.status).json({ error: outcome.error });
        return;
      }

      const inserted = await run(
        db,
        `INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost, currency)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          outcome.input.customer_id,
          outcome.input.active_users,
          outcome.input.storage_gb,
          outcome.input.api_calls,
          outcome.priced.amount,
          outcome.priced.currency,
        ],
      );

      res.status(201).json({
        message: 'Simulación guardada',
        simulation: {
          id: inserted.lastID,
          customer_id: outcome.input.customer_id,
          active_users: outcome.input.active_users,
          storage_gb: outcome.input.storage_gb,
          api_calls: outcome.input.api_calls,
          calculated_cost: outcome.priced.amount,
          currency: outcome.priced.currency,
        },
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error interno al guardar la simulación.' });
    }
  });

  app.get('/simulations/customer/:customerId', async (req, res) => {
    const customerId = Number(req.params.customerId);
    if (!Number.isInteger(customerId) || customerId < 1) {
      res.status(400).json({ error: 'Cliente no válido.' });
      return;
    }

    try {
      const rows = await all(
        db,
        `SELECT id, customer_id, active_users, storage_gb, api_calls, calculated_cost, currency
         FROM simulations WHERE customer_id = ? ORDER BY id DESC`,
        [customerId],
      );
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error de BD al recuperar historial.' });
    }
  });

  return app;
}

async function priceSimulation(db, getRates, body) {
  const parsed = parseSimulationBody(body);
  if (!parsed.ok) {
    return { status: 400, error: parsed.error };
  }

  const customer = await get(db, 'SELECT id, country FROM customers WHERE id = ?', [parsed.value.customer_id]);
  if (!customer) {
    return { status: 404, error: 'Cliente no encontrado.' };
  }

  let rates = { USD: 1, GBP: 1 };
  if (parsed.value.currency !== 'EUR') {
    try {
      rates = await getRates();
    } catch (err) {
      console.error(err);
      return { status: 503, error: 'No se pudieron obtener los tipos de cambio.' };
    }
  }

  let priced;
  try {
    priced = quote({
      activeUsers: parsed.value.active_users,
      country: customer.country,
      currency: parsed.value.currency,
      rates,
    });
  } catch (err) {
    console.error(err);
    return { status: 503, error: 'No se pudieron obtener los tipos de cambio.' };
  }

  return {
    input: parsed.value,
    priced,
    body: {
      calculated_cost: priced.amount,
      currency: priced.currency,
      total_eur: priced.totalEur,
      rate: priced.rate,
      active_users: parsed.value.active_users,
      storage_gb: parsed.value.storage_gb,
      api_calls: parsed.value.api_calls,
    },
  };
}

function findCustomerByTaxId(db, taxId) {
  return get(db, `SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE tax_id = ?`, [taxId]);
}

function findCustomerById(db, id) {
  return get(db, `SELECT ${CUSTOMER_COLUMNS} FROM customers WHERE id = ?`, [id]);
}

function isUniqueViolation(err) {
  return err && (err.code === 'SQLITE_CONSTRAINT' || /UNIQUE/i.test(err.message || ''));
}

if (require.main === module) {
  const filename = process.env.SQLITE_PATH || path.join(__dirname, 'database.sqlite');
  initDatabase(filename)
    .then((db) => {
      const port = process.env.PORT || 3000;
      createApp(db).listen(port, () => {
        console.log(`Backend en http://localhost:${port}`);
      });
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}

module.exports = { createApp };
