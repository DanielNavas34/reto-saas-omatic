const RATES_URL = 'https://open.er-api.com/v6/latest/EUR';
const TEN_MINUTES = 10 * 60 * 1000;

let cache = null;

async function fetchRates() {
  if (cache && Date.now() - cache.fetchedAt < TEN_MINUTES) {
    return cache.rates;
  }

  const response = await fetch(RATES_URL);
  if (!response.ok) {
    throw new Error(`Exchange rate provider responded ${response.status}`);
  }

  const data = await response.json();
  const usd = data?.rates?.USD;
  const gbp = data?.rates?.GBP;
  if (typeof usd !== 'number' || typeof gbp !== 'number' || usd <= 0 || gbp <= 0) {
    throw new Error('Exchange rate provider returned an unexpected payload');
  }

  const rates = { USD: usd, GBP: gbp };
  cache = { rates, fetchedAt: Date.now() };
  return rates;
}

module.exports = { fetchRates, RATES_URL };
