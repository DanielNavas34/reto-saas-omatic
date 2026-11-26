# SaaS-O-Matic

Commercial dashboard for a small technical exercise. A salesperson registers a company, checks a Spanish tax id, and saves a usage quote. The server owns the price. The browser cannot set the amount that is stored.

## Pricing

Tiers are cumulative:

- Users 1–10: 10 EUR each
- Users 11–50: 8 EUR each
- Users above 50: 5 EUR each

15 users cost `10 × 10 + 5 × 8 = 140 EUR` before tax. Spain adds 21% VAT, so the stored EUR total is **169.40 EUR**. Other countries add no tax in this exercise. USD and GBP are that EUR total times a rate fetched by the server from `open.er-api.com` (cached for 10 minutes). `calculated_cost` sent by the client is ignored.

`storage_gb` and `api_calls` are collected in the form and stored with the quote. They do not change the price. `plan_type` is stored on the customer and does not change the price either.

## Limits

- SQLite file at `backend/database.sqlite`. No login.
- Spain requires a real DNI, NIE, or CIF control digit. Other countries only need a non-empty tax id.
- A repeated tax id returns the **stored** customer. The form does not overwrite the name, email, country, or plan.
- If startup fails because `tax_id` is not unique in an old file, delete `backend/database.sqlite` and start again.

What was wrong in the first generated version, and what changed, is in [REVIEW.md](REVIEW.md).

## Run locally

Backend, then frontend, in two terminals:

```bash
cd backend
npm install
npm start
```

```bash
cd frontend
npm install
npm start
```

Open [http://127.0.0.1:4200](http://127.0.0.1:4200). The API listens on [http://localhost:3000](http://localhost:3000).

`npm start` in `backend` compiles the TypeScript domain (`src/tax-id.ts`, `src/pricing.ts`, `src/validate.ts`) before booting Express.

## Tests

```bash
cd backend && npm test
cd frontend && npm test
```

Backend checks the 140 EUR tier, Spanish VAT, DNI/NIE/CIF control digits, HTTP 400 for a bad DNI, the same customer id on a second registration, and a USD total equal to euros times a rate fixed in the test (the body sends `calculated_cost: 1` and it is ignored).
