# Review of the generated code

The first pass was produced with an LLM from the exercise brief. Three problems were real, and the notes in `ai-workspace` described guarantees the code did not have. This file is the review.

## 1. A non-EUR total trusted the browser

`POST /simulations` rebuilt the EUR price, then, for any other currency, did `rate = calculated_cost / totalEuros` with the number the page had just sent. Whatever the client put in `calculated_cost` was what got stored.

The price now comes from `quote()` in `backend/src/pricing.ts`. The handler never reads `calculated_cost`. USD and GBP use a rate supplied to that function. In tests the rate is fixed at 2 USD per EUR, and the saved amount for 15 users in Spain is 338.80 even when the body says `calculated_cost: 1`. The live figure on the page is the response from `POST /quotes`, not a value written into the DOM.

## 2. The fiscal id and the tables were weaker than the write-up claimed

DNI and NIE used the official mod-23 letter. CIF was only a shape check, so a wrong control character passed. `tax_id` had no unique constraint, and `simulations.customer_id` had no foreign key. A second `POST /customers` returned the old id while the card kept painting the new name and email from the form.

CIF now checks the control digit (digit or letter, depending on the organization type). Startup creates a unique index on `tax_id` and rebuilds `simulations` with a foreign key when an older file has neither. The API returns the stored row, and the card renders that row. The form says so when the id already existed. Storage and API-call counts come from the form; they used to be hardcoded as 10 and 1000.

## 3. The Angular app worked around Angular

`ApiService` and `CurrencyService` were unused. The components called `fetch('http://localhost:3000/...')`, and the quote was pushed with `innerText` because change detection was not updating the view. `guardarSimulacion()` treated any resolved `fetch` as success, including HTTP 400 and 500. `api.spec.ts` imported a class named `Api`, and `currency.spec.ts` imported `Currency`. Those classes do not exist, so the specs could not run.

The page now talks only through the two services. The base URL lives in `frontend/src/app/api-url.ts`. The price is an interpolation. A failed save leaves the success state off and shows the API error. Customer and simulation payloads are typed. The history reloads from the saved simulation, not from a counter incremented in the root component.
