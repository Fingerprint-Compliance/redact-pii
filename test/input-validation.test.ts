import { AsyncRedactor, SyncRedactor } from '../src';

describe('non-string input validation', function () {
  const sync = new SyncRedactor();
  const asyncRedactor = new AsyncRedactor();

  it('SyncRedactor.redact throws TypeError for non-strings', function () {
    for (const value of [null, undefined, 123, {}, [], true] as unknown[]) {
      expect(() => sync.redact(value as string)).toThrow(TypeError);
      expect(() => sync.redact(value as string)).toThrow(/expected a string/);
    }
  });

  it('AsyncRedactor.redactAsync throws TypeError for non-strings', async function () {
    for (const value of [null, undefined, 123, {}, [], true] as unknown[]) {
      await expect(asyncRedactor.redactAsync(value as string)).rejects.toThrow(TypeError);
      await expect(asyncRedactor.redactAsync(value as string)).rejects.toThrow(/expected a string/);
    }
  });

  it('accepts empty string', function () {
    expect(sync.redact('')).toBe('');
  });
});
