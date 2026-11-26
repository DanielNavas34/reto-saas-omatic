import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { quote, tieredBaseCost } from './pricing';

const RATES = { USD: 2, GBP: 0.5 };

describe('tiered pricing', () => {
  it('prices 15 users at 140 EUR before tax', () => {
    assert.equal(tieredBaseCost(15), 140);
  });

  it('adds 21% VAT for Spain', () => {
    const result = quote({
      activeUsers: 15,
      country: 'España',
      currency: 'EUR',
      rates: RATES,
    });

    assert.equal(result.baseEur, 140);
    assert.equal(result.totalEur, 169.4);
    assert.equal(result.amount, 169.4);
  });

  it('converts with the supplied rate and has no client amount input', () => {
    const result = quote({
      activeUsers: 15,
      country: 'España',
      currency: 'USD',
      rates: RATES,
    });

    assert.equal(result.rate, 2);
    assert.equal(result.amount, 338.8);
  });
});
