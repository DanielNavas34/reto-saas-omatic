const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { initDatabase } = require('../database/db');
const { createApp } = require('../server');

describe('customers and simulations API', () => {
  let server;
  let base;

  before(async () => {
    const db = await initDatabase(':memory:');
    const app = createApp(db, {
      getRates: async () => ({ USD: 2, GBP: 0.5 }),
    });
    await new Promise((resolve) => {
      server = app.listen(0, '127.0.0.1', resolve);
    });
    base = `http://127.0.0.1:${server.address().port}`;
  });

  after(() => new Promise((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  }));

  it('returns 400 for an invalid DNI', async () => {
    const { status, payload } = await post(base, '/customers', {
      company_name: 'Acme',
      tax_id: '12345678A',
      email: 'a@acme.test',
      country: 'España',
      plan_type: 'Básico',
    });

    assert.equal(status, 400);
    assert.match(payload.error, /no válido/);
  });

  it('returns the stored customer when the tax id already exists', async () => {
    const original = {
      company_name: 'Acme',
      tax_id: '12345678Z',
      email: 'a@acme.test',
      country: 'España',
      plan_type: 'Básico',
    };
    const first = await post(base, '/customers', original);
    const second = await post(base, '/customers', {
      ...original,
      company_name: 'Otra empresa',
      email: 'otra@empresa.test',
      plan_type: 'Pro',
    });

    assert.equal(first.status, 201);
    assert.equal(second.status, 200);
    assert.equal(second.payload.customer.id, first.payload.customer.id);
    assert.equal(second.payload.customer.company_name, 'Acme');
    assert.equal(second.payload.customer.email, 'a@acme.test');
    assert.equal(second.payload.customer.plan_type, 'Básico');
  });

  it('stores USD as euros times the injected rate and ignores calculated_cost', async () => {
    const created = await post(base, '/customers', {
      company_name: 'Northwind',
      tax_id: '00000000T',
      email: 'n@northwind.test',
      country: 'España',
      plan_type: 'Pro',
    });

    const saved = await post(base, '/simulations', {
      customer_id: created.payload.customer.id,
      active_users: 15,
      storage_gb: 20,
      api_calls: 500,
      currency: 'USD',
      calculated_cost: 1,
    });

    assert.equal(saved.status, 201);
    assert.equal(saved.payload.simulation.calculated_cost, 338.8);
    assert.equal(saved.payload.simulation.currency, 'USD');
    assert.equal(saved.payload.simulation.storage_gb, 20);
    assert.equal(saved.payload.simulation.api_calls, 500);
  });
});

async function post(base, path, body) {
  const response = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const payload = await response.json();
  return { status: response.status, payload };
}
