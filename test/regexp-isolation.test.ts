import { NameRedactor } from '../src/built-ins/NameRedactor';
import { SimpleRegexpRedactor } from '../src/built-ins/SimpleRegexpRedactor';
import { creditCardNumber } from '../src/built-ins/simple-regexp-patterns';
import { SyncRedactor } from '../src';

describe('RegExp isolation across redactor instances', function () {
  it('SimpleRegexpRedactor clones the pattern so instances do not share lastIndex', function () {
    const shared = creditCardNumber;
    const a = new SimpleRegexpRedactor({
      regexpPattern: shared,
      replaceWith: 'CARD_A',
    });
    const b = new SimpleRegexpRedactor({
      regexpPattern: shared,
      replaceWith: 'CARD_B',
    });

    expect(a.regexpMatcher).not.toBe(shared);
    expect(b.regexpMatcher).not.toBe(shared);
    expect(a.regexpMatcher).not.toBe(b.regexpMatcher);

    // Dirty the shared module pattern's lastIndex; instance redactors must still match.
    shared.lastIndex = 999;
    const text = 'card 4111111111111111 here';
    expect(a.redact(text)).toBe('card CARD_A here');
    expect(b.redact(text)).toBe('card CARD_B here');
  });

  it('distinct NameRedactor instances do not share match state', function () {
    const a = new NameRedactor('NAME_A');
    const b = new NameRedactor('NAME_B');
    const text = 'Dear David Johnson,\nPlease call me.\nThanks,\nAlice';

    expect(a.redact(text)).toBe('Dear NAME_A,\nPlease call me.\nThanks,\nNAME_A');
    expect(b.redact(text)).toBe('Dear NAME_B,\nPlease call me.\nThanks,\nNAME_B');
  });

  it('concurrent SyncRedactor instances produce consistent results', async function () {
    const redactors = Array.from({ length: 8 }, () => new SyncRedactor());
    const input = 'Dear David Johnson, SSN 123-45-6789 card 4111111111111111 email a@b.co';

    const results = await Promise.all(redactors.map((r) => Promise.resolve(r.redact(input))));
    const expected = results[0];
    for (const result of results) {
      expect(result).toBe(expected);
    }
    expect(expected).toContain('PERSON_NAME');
    expect(expected).toContain('US_SOCIAL_SECURITY_NUMBER');
    expect(expected).toContain('CREDIT_CARD_NUMBER');
    expect(expected).toContain('EMAIL_ADDRESS');
  });
});
