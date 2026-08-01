import { SyncRedactor } from '../src';

const redactor = new SyncRedactor({
  // Isolate well-known name list behavior from other built-ins where possible.
  builtInRedactors: {
    digits: { enabled: false },
  },
});

describe('well-known name matching boundaries', function () {
  it('should not redact names glued to identifiers (_ / digits)', function () {
    expect(redactor.redact('user_john')).toBe('user_john');
    expect(redactor.redact('john123')).toBe('john123');
    expect(redactor.redact('123john')).toBe('123john');
    expect(redactor.redact('_john')).toBe('_john');
    expect(redactor.redact('apiKey_david_secret')).toBe('apiKey_david_secret');
  });

  it('should still redact standalone well-known names', function () {
    expect(redactor.redact('here is Clifford')).toBe('here is PERSON_NAME');
    expect(redactor.redact('clifford')).toBe('PERSON_NAME');
    expect(redactor.redact('CLIFFORD')).toBe('PERSON_NAME');
  });

  it('should redact consecutive well-known names with or without spaces', function () {
    expect(redactor.redact('David Johnson')).toBe('PERSON_NAME');
    // Historical alternation allowed empty \\s* between names (e.g. david+john).
    expect(redactor.redact('davidjohn')).toBe('PERSON_NAME');
  });
});
