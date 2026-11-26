const fs = require('fs');
const os = require('os');
const path = require('path');
const { describe, it, after } = require('node:test');
const assert = require('node:assert/strict');
const sqlite3 = require('sqlite3');
const { initDatabase, all, get, run } = require('../database/db');

describe('existing database migration', () => {
  const filename = path.join(os.tmpdir(), `saas-omatic-${process.pid}.sqlite`);
  let db;

  after(async () => {
    if (db) {
      await new Promise((resolve, reject) => {
        db.close((err) => (err ? reject(err) : resolve()));
      });
    }
    fs.rmSync(filename, { force: true });
  });

  it('keeps old rows that have a null cost and adds the foreign key', async () => {
    await execFile(filename, `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        company_name TEXT,
        tax_id TEXT,
        email TEXT,
        country TEXT,
        plan_type TEXT
      );
      INSERT INTO customers (company_name, tax_id, email, country, plan_type)
      VALUES ('Acme', '12345678Z', 'a@acme.test', 'España', 'Básico');
      CREATE TABLE simulations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER,
        active_users INTEGER,
        storage_gb INTEGER,
        api_calls INTEGER,
        calculated_cost REAL
      );
      INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost)
      VALUES (1, 15, NULL, NULL, NULL);
    `);

    db = await initDatabase(filename);
    const row = await get(
      db,
      'SELECT active_users, storage_gb, api_calls, calculated_cost, currency FROM simulations WHERE id = 1',
    );
    assert.equal(row.active_users, 15);
    assert.equal(row.storage_gb, 0);
    assert.equal(row.api_calls, 0);
    assert.equal(row.calculated_cost, 0);
    assert.equal(row.currency, 'EUR');

    const foreignKeys = await all(db, 'PRAGMA foreign_key_list(simulations)');
    assert.ok(foreignKeys.length > 0);

    await assert.rejects(
      run(
        db,
        `INSERT INTO simulations (customer_id, active_users, storage_gb, api_calls, calculated_cost, currency)
         VALUES (999, 1, 1, 1, 10, 'EUR')`,
      ),
      (err) => err && err.code === 'SQLITE_CONSTRAINT',
    );
  });
});

function execFile(filename, sql) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(filename, (openErr) => {
      if (openErr) {
        reject(openErr);
        return;
      }
      db.exec(sql, (execErr) => {
        db.close((closeErr) => {
          if (execErr) {
            reject(execErr);
            return;
          }
          if (closeErr) {
            reject(closeErr);
            return;
          }
          resolve();
        });
      });
    });
  });
}
