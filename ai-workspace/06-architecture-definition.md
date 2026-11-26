# Architecture

The current layout. The gaps in the first generated version are listed in [../REVIEW.md](../REVIEW.md).

## Database

SQLite, one file, created on startup.

- `customers`: company, unique `tax_id`, email, country, plan. The plan is stored and is not an input to the price.
- `simulations`: `customer_id` references `customers`. Each row keeps users, storage, API calls, the server-side amount, and the currency. Storage and API calls are recorded and are not inputs to the price.
- Foreign keys are enabled on the connection. An older database without the unique index or the foreign key is migrated on startup.

## Modules

- `backend/src/tax-id.ts`, `pricing.ts`, and `validate.ts` are the TypeScript domain: tax id, tiered price, and request bodies. Express in `server.js` is the HTTP shell.
- `frontend/src/app/services/api.ts` is the only client of `/customers`, `/quotes`, `/simulations`, and the history.
- `frontend/src/app/services/currency.ts` reads `GET /rates`. The server fetches `open.er-api.com` and caches the result. The browser does not choose the rate used for the stored amount.
- Angular standalone components: `search`, `customer-card`, `simulation-form`.

## Request rules

`POST /customers` requires name, tax id, email, country, and plan. Spain runs the DNI/NIE/CIF check. A known tax id returns the stored customer and does not update it.

`POST /quotes` and `POST /simulations` require a customer id, integer users, storage, and API calls (`>= 0`), and a currency of EUR, USD, or GBP. The amount is computed on the server.
