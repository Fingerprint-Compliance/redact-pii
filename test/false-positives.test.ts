import { SyncRedactor } from '../src';

const redactor = new SyncRedactor();

describe('false positive reductions', function () {
  it('should not treat order/invoice numbers as zip codes', function () {
    expect(redactor.redact('Order #12345')).toBe('Order #12345');
    expect(redactor.redact('Invoice #98765')).toBe('Invoice #98765');
    expect(redactor.redact('Order 12345')).toBe('Order 12345');
  });

  it('should still redact ZIP when preceded by a US state code', function () {
    expect(redactor.redact('NY 10002')).toBe('NY ZIPCODE');
    expect(redactor.redact('CA 90210-1234')).toBe('CA ZIPCODE');
  });

  it('should not redact years or short port numbers as DIGITS by default', function () {
    expect(redactor.redact('The year is 2024')).toBe('The year is 2024');
    expect(redactor.redact('port 8080')).toBe('port 8080');
  });

  it('should not partially redact UUIDs as phone numbers', function () {
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(redactor.redact(uuid)).toBe(uuid);
  });

  it('should not treat prose "secret:" as a password label', function () {
    expect(redactor.redact('The secret: is out')).toBe('The secret: is out');
  });

  it('should still redact password and pass labels', function () {
    expect(redactor.redact('password: baz123')).toBe('PASSWORD');
    expect(redactor.redact('pass: 1$d0P3!')).toBe('PASSWORD');
  });

  it('should not treat org support signatures as person names', function () {
    expect(redactor.redact('Thanks,\nGoogle Support')).toBe('Thanks,\nGoogle Support');
    expect(redactor.redact('All the best,\n\n-Acme Support')).toBe('All the best,\n\n-Acme Support');
  });

  it('should still redact person names after greetings/closings', function () {
    expect(redactor.redact('Thanks -Jon')).toBe('Thanks -PERSON_NAME');
    expect(redactor.redact('Dear David Johnson,')).toBe('Dear PERSON_NAME,');
  });

  it('should require a dotted domain for email addresses', function () {
    expect(redactor.redact('a@b')).toBe('a@b');
    expect(redactor.redact('contact a@b.c please')).toBe('contact EMAIL_ADDRESS please');
  });

  it('should not mangle partial account tokens via digits by default', function () {
    expect(redactor.redact('ACCT-000011')).toBe('ACCT-000011');
  });

  it('should still redact well-formed phone numbers', function () {
    expect(redactor.redact('call 555-555-5555')).toBe('call PHONE_NUMBER');
    expect(redactor.redact('call 5551231234')).toBe('call PHONE_NUMBER');
  });
});
