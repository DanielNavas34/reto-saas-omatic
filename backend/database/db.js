const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.sqlite', (err) => {
    if (err) {
        console.error('Error al conectar con SQLite:', err.message);
    } else {
        console.log('Conexión exitosa a la base de datos SQLite.');
        
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS customers (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT,
                tax_id TEXT,
                email TEXT,
                country TEXT,
                plan_type TEXT
            )`);

            // ¡Aquí está la clave! Añadimos currency TEXT al final
            db.run(`CREATE TABLE IF NOT EXISTS simulations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                customer_id INTEGER,
                active_users INTEGER,
                storage_gb INTEGER,
                api_calls INTEGER,
                calculated_cost REAL,
                currency TEXT
            )`);
        });
    }
});

module.exports = db;