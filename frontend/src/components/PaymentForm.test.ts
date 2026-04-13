import { describe, it, expect } from 'vitest';
import { validate, formatCardNumber, formatExpiry } from '../components/PaymentForm';

// Los tipos Fields/FieldErrors son internos a PaymentForm; los recreamos aquí para los tests
interface Fields {
  cardholderName: string;
  cardNumber: string;
  expiry: string;
  cvc: string;
}

const validFields: Fields = {
  cardholderName: 'Test User',
  cardNumber: '4242 4242 4242 4242',
  expiry: '12/34',
  cvc: '123',
};

// ─── validate() ─────────────────────────────────────────────────────────────
describe('validate()', () => {
  it('returns no errors for a fully valid input', () => {
    const errors = validate(validFields);
    expect(Object.keys(errors)).toHaveLength(0);
  });

  it('rejects empty cardholderName', () => {
    const errors = validate({ ...validFields, cardholderName: '   ' });
    expect(errors.cardholderName).toBeDefined();
  });

  it('rejects card number with fewer than 16 digits', () => {
    const errors = validate({ ...validFields, cardNumber: '4242 4242' });
    expect(errors.cardNumber).toBeDefined();
  });

  it('rejects card number with letters', () => {
    const errors = validate({ ...validFields, cardNumber: '4242 abcd 4242 4242' });
    expect(errors.cardNumber).toBeDefined();
  });

  it('accepts card number with 16 digits and spaces', () => {
    const errors = validate({ ...validFields, cardNumber: '1234 5678 9012 3456' });
    expect(errors.cardNumber).toBeUndefined();
  });

  it('rejects expiry with wrong month (00)', () => {
    const errors = validate({ ...validFields, expiry: '00/25' });
    expect(errors.expiry).toBeDefined();
  });

  it('rejects expiry with wrong month (13)', () => {
    const errors = validate({ ...validFields, expiry: '13/25' });
    expect(errors.expiry).toBeDefined();
  });

  it('rejects expiry without slash', () => {
    const errors = validate({ ...validFields, expiry: '1234' });
    expect(errors.expiry).toBeDefined();
  });

  it('accepts valid expiry MM/YY', () => {
    const errors = validate({ ...validFields, expiry: '01/30' });
    expect(errors.expiry).toBeUndefined();
  });

  it('rejects CVC with 2 digits', () => {
    const errors = validate({ ...validFields, cvc: '12' });
    expect(errors.cvc).toBeDefined();
  });

  it('rejects CVC with 5 digits', () => {
    const errors = validate({ ...validFields, cvc: '12345' });
    expect(errors.cvc).toBeDefined();
  });

  it('accepts CVC with 3 digits', () => {
    const errors = validate({ ...validFields, cvc: '123' });
    expect(errors.cvc).toBeUndefined();
  });

  it('accepts CVC with 4 digits (Amex)', () => {
    const errors = validate({ ...validFields, cvc: '1234' });
    expect(errors.cvc).toBeUndefined();
  });

  it('rejects CVC with letters', () => {
    const errors = validate({ ...validFields, cvc: 'abc' });
    expect(errors.cvc).toBeDefined();
  });
});

// ─── formatCardNumber() ──────────────────────────────────────────────────────
describe('formatCardNumber()', () => {
  it('formats 16 digits with spaces every 4', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  it('strips non-digit characters', () => {
    expect(formatCardNumber('4242-4242-4242-4242')).toBe('4242 4242 4242 4242');
  });

  it('truncates input longer than 16 digits', () => {
    expect(formatCardNumber('42424242424242421234')).toBe('4242 4242 4242 4242');
  });

  it('handles partial input gracefully', () => {
    expect(formatCardNumber('4242')).toBe('4242');
  });

  it('returns empty string for empty input', () => {
    expect(formatCardNumber('')).toBe('');
  });
});

// ─── formatExpiry() ──────────────────────────────────────────────────────────
describe('formatExpiry()', () => {
  it('inserts slash after 2 digits', () => {
    expect(formatExpiry('1234')).toBe('12/34');
  });

  it('handles input that already has a slash', () => {
    expect(formatExpiry('12/3')).toBe('12/3');
  });

  it('strips non-digit characters before formatting', () => {
    expect(formatExpiry('12/34')).toBe('12/34');
  });

  it('handles less than 2 digits', () => {
    expect(formatExpiry('1')).toBe('1');
  });
});
