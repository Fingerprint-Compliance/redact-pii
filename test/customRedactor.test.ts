import { SyncRedactor } from '../src';

const customRedactor = new SyncRedactor({
  builtInRedactors: {
    zipcode: {
      enabled: false,
    },
    digits: {
      enabled: false,
    },
  },
  customRedactors: {
    before: [
      {
        regexpPattern: /(banana|apple|orange)/,
        replaceWith: 'FOOD',
      },
    ],
  },
});

describe('custom redactors', function () {
  it('should apply custom patterns and still redact built-in PII', function () {
    expect(customRedactor.redact("Hey it's David Johnson with 1234")).toBe("Hey it's PERSON_NAME with 1234");
    expect(customRedactor.redact('Hi banana, my credit card is 4111111111111111 and I need help. Thanks, John')).toBe(
      'Hi FOOD, my credit card is CREDIT_CARD_NUMBER and I need help. Thanks, PERSON_NAME',
    );
  });

  it('should honor disabled built-in redactors', function () {
    expect(customRedactor.redact('zip 90210 and code 1234')).toBe('zip 90210 and code 1234');
  });
});
