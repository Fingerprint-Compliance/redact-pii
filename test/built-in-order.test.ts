import { SyncRedactor } from '../src';
import { BUILT_IN_REGEXP_REDACTOR_ORDER } from '../src/composition';
import * as simpleRegexpBuiltIns from '../src/built-ins/simple-regexp-patterns';

describe('built-in redactor order', function () {
  it('lists every simple-regexp built-in exactly once', function () {
    const exported = Object.keys(simpleRegexpBuiltIns).sort();
    const ordered = [...BUILT_IN_REGEXP_REDACTOR_ORDER].sort();
    expect(ordered).toEqual(exported);
  });

  it('applies SSN before opt-in digits so structured SSNs keep the SSN label', function () {
    const redactor = new SyncRedactor({
      builtInRedactors: { digits: { enabled: true } },
    });
    expect(redactor.redact('ssn 123-45-6789')).toBe('ssn US_SOCIAL_SECURITY_NUMBER');
  });

  it('applies credit card before opt-in digits so PANs keep the card label', function () {
    const redactor = new SyncRedactor({
      builtInRedactors: { digits: { enabled: true } },
    });
    expect(redactor.redact('card 4111111111111111')).toBe('card CREDIT_CARD_NUMBER');
  });

  it('places digits after more specific patterns in the explicit order list', function () {
    const digitsIndex = BUILT_IN_REGEXP_REDACTOR_ORDER.indexOf('digits');
    const ssnIndex = BUILT_IN_REGEXP_REDACTOR_ORDER.indexOf('usSocialSecurityNumber');
    const cardIndex = BUILT_IN_REGEXP_REDACTOR_ORDER.indexOf('creditCardNumber');
    expect(digitsIndex).toBe(BUILT_IN_REGEXP_REDACTOR_ORDER.length - 1);
    expect(ssnIndex).toBeLessThan(digitsIndex);
    expect(cardIndex).toBeLessThan(digitsIndex);
  });
});
