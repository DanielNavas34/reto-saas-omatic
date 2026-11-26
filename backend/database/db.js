const sqlite3 = require('sqlite3').verbose();

const FRESH_SCHEMA = `
CREATE TABLE customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  company_name TEXT NOT NULL,
  tax_id TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL,
  country TEXT NOT NULL,
  plan_type TEXT NOT NULL
);

CREATE TABLE simulations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  customer_id INTEGER NOT NULL,
  active_users INTEGER NOT NULL,
  storage_gb INTEGER NOT NULL,
  api_calls INTEGER NOT NULL,
  calculated_cost REAL NOT NULL,
  currency TEXT NOT NULL,
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);
`;

function initDatabase(filename) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filename, (err) => {
      if (err) {
        reject(err);
        return;
      }
      migrate(db).then(() => resolve(db)).catch(reject);
    });
  });
}

async function migrate(db) {
  await run(db, 'PRAGMA foreign_keys = ON');
  const existing = await get(
    db,
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'customers'",
  );

  if (!existing) {
    await exec(db, FRESH_SCHEMA);
    return;
  }

  try {
    await run(db, 'CREATE UNIQUE INDEX IF NOT EXISTS idx_customers_tax_id ON customers(tax_id)');
  } catch (err) {
    throw new Error(
      `Could not enforce a unique tax_id. Delete backend/database.sqlite and start again. ${err.message}`,
    );
  }

  let columns = await all(db, 'PRAGMA table_info(simulations)');
  if (columns.length === 0) {
    await exec(db, `
      CREATE TABLE simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        active_users INTEGER NOT NULL,
        storage_gb INTEGER NOT NULL,
        api_calls INTEGER NOT NULL,
        calculated_cost REAL NOT NULL,
        currency TEXT NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      );
    `);
    return;
  }

  if (!columns.some((column) => column.name === 'currency')) {
    await run(db, 'ALTER TABLE simulations ADD COLUMN currency TEXT');
    columns = await all(db, 'PRAGMA table_info(simulations)');
  }

  const foreignKeys = await all(db, 'PRAGMA foreign_key_list(simulations)');
  if (foreignKeys.length === 0) {
    await rebuildSimulations(db);
  }
}

async function rebuildSimulations(db) {
  await exec(db, `
    DROP TABLE IF EXISTS simulations_new;
    PRAGMA foreign_keys = OFF;
    BEGIN;
    CREATE TABLE simulations_new (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      active_users INTEGER NOT NULL,
      storage_gb INTEGER NOT NULL,
      api_calls INTEGER NOT NULL,
      calculated_cost REAL NOT NULL,
      currency TEXT NOT NULL,
      FOREIGN KEY (customer_id) REFERENCES customers(id)
    );
    INSERT INTO simulations_new (id, customer_id, active_users, storage_gb, api_calls, calculated_cost, currency)
    SELECT
      id,
      customer_id,
      COALESCE(active_users, 0),
      COALESCE(storage_gb, 0),
      COALESCE(api_calls, 0),
      COALESCE(calculated_cost, 0),
      COALESCE(currency, 'EUR')
    FROM simulations
    WHERE customer_id IN (SELECT id FROM customers);
    DROP TABLE simulations;
    ALTER TABLE simulations_new RENAME TO simulations;
    COMMIT;
    PRAGMA foreign_keys = ON;
  `);
}

function all(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => (err ? reject(err) : resolve(rows)));
  });
}

function get(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => (err ? reject(err) : resolve(row)));
  });
}

function run(db, sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
}

function exec(db, sql) {
  return new Promise((resolve, reject) => {
    db.exec(sql, (err) => (err ? reject(err) : resolve()));
  });
}

module.exports = { initDatabase, all, get, run };
