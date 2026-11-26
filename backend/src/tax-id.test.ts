import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { isValidSpanishTaxId } from './tax-id';

describe('Spanish tax ids', () => {
  it('accepts a valid DNI and rejects a bad control letter', () => {
    assert.equal(isValidSpanishTaxId('12345678Z'), true);
    assert.equal(isValidSpanishTaxId('12345678A'), false);
  });

  it('accepts a valid NIE', () => {
    assert.equal(isValidSpanishTaxId('X1234567L'), true);
  });

  it('checks the CIF control digit', () => {
    assert.equal(isValidSpanishTaxId('A58818501'), true);
    assert.equal(isValidSpanishTaxId('A58818502'), false);
    assert.equal(isValidSpanishTaxId('P0000000J'), true);
    assert.equal(isValidSpanishTaxId('P0000000A'), false);
  });
});
