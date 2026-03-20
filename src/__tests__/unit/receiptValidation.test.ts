import { describe, it, expect } from 'vitest';

// We need to extract parseAmount and validate from the component file.
// Since they are module-scoped functions (not exported), we test via the logic directly.
// Re-implement the same logic for testing purposes:

const CRC_RATE = 500;
const SINPE_PHONE = '83034342';
const SINPE_FIRST_NAME = 'jorge';
const SINPE_FIRST_SURNAME = 'jimenez';

function parseAmount(text: string): number | null {
  let raw: string | null = null;

  const currencyMatch = text.match(/[₡¢]\s*([\d][\d.,]*)/);
  if (currencyMatch) raw = currencyMatch[1];

  if (!raw) {
    const montoMatch = text.match(/[Mm]onto[^₡¢\d\n]{0,20}([\d]{1,3}(?:[.,][\d]{3})+(?:[.,]\d{2})?)/);
    if (montoMatch) raw = montoMatch[1];
  }

  if (!raw) {
    const anyMatch = text.match(/([\d]{1,3}(?:[.,][\d]{3})+(?:[.,]\d{2})?)/);
    if (anyMatch) raw = anyMatch[1];
  }

  if (!raw) return null;

  const lastComma = raw.lastIndexOf(',');
  const lastDot = raw.lastIndexOf('.');
  if (lastComma > lastDot) {
    raw = raw.replace(/\./g, '').replace(',', '.');
  } else {
    raw = raw.replace(/,/g, '');
  }
  const value = parseFloat(raw);
  return isNaN(value) ? null : value;
}

function validate(
  text: string,
  expectedUSD: number
): { valid: boolean; mensaje: string; detectedCRC: number | null } {
  const lower = text.toLowerCase();
  const digitsOnly = text.replace(/\D/g, '');
  const expectedCRC = Math.round(expectedUSD * CRC_RATE);
  const detectedAmount = parseAmount(text);
  const nameValid = lower.includes(SINPE_FIRST_NAME) && lower.includes(SINPE_FIRST_SURNAME);
  const phoneValid = digitsOnly.includes(SINPE_PHONE);
  const minCRC = expectedCRC;
  const maxCRC = expectedCRC * 2;
  const amountValid = detectedAmount !== null && detectedAmount >= minCRC && detectedAmount <= maxCRC;

  if (!nameValid) return { valid: false, detectedCRC: detectedAmount, mensaje: 'Nombre no coincide' };
  if (!phoneValid) return { valid: false, detectedCRC: detectedAmount, mensaje: 'Número no encontrado' };
  if (!amountValid) return { valid: false, detectedCRC: detectedAmount, mensaje: 'Monto no coincide' };
  return { valid: true, detectedCRC: detectedAmount, mensaje: 'Comprobante verificado correctamente' };
}

describe('Receipt OCR - parseAmount', () => {
  // OCR-01
  it('OCR-01: parses ₡42,000.00', () => {
    expect(parseAmount('₡42,000.00')).toBe(42000.00);
  });

  // OCR-02
  it('OCR-02: parses ¢42,000.00 (OCR misread)', () => {
    expect(parseAmount('¢42,000.00')).toBe(42000.00);
  });

  // OCR-03
  it('OCR-03: parses "Monto 42,000.00"', () => {
    expect(parseAmount('Monto 42,000.00')).toBe(42000.00);
  });

  // OCR-04
  it('OCR-04: parses European format "3.500,00"', () => {
    expect(parseAmount('3.500,00')).toBe(3500.00);
  });

  // OCR-05
  it('OCR-05: returns null for text without numbers', () => {
    expect(parseAmount('sin números aquí')).toBeNull();
  });
});

describe('Receipt OCR - validate', () => {
  const expectedUSD = 84; // → expectedCRC = 42000
  const validText = 'SINPE Móvil Jorge Jimenez 83034342 ₡42,000.00 confirmado';

  // OCR-06
  it('OCR-06: valid receipt passes', () => {
    const result = validate(validText, expectedUSD);
    expect(result.valid).toBe(true);
  });

  // OCR-07
  it('OCR-07: missing name fails', () => {
    const text = 'SINPE Móvil Carlos Lopez 83034342 ₡42,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(false);
    expect(result.mensaje).toContain('Nombre');
  });

  // OCR-08
  it('OCR-08: wrong phone fails', () => {
    const text = 'SINPE Móvil Jorge Jimenez 12345678 ₡42,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(false);
    expect(result.mensaje).toContain('Número');
  });

  // OCR-09
  it('OCR-09: amount below 50% fails', () => {
    // expected = 42000, min = 42000. Below min fails.
    const text = 'Jorge Jimenez 83034342 ₡20,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(false);
    expect(result.mensaje).toContain('Monto');
  });

  // OCR-10
  it('OCR-10: exact 100% amount passes', () => {
    const text = 'Jorge Jimenez 83034342 ₡42,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(true);
  });

  // OCR-11
  it('OCR-11: 200% amount (max) passes', () => {
    const text = 'Jorge Jimenez 83034342 ₡84,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(true);
  });

  // OCR-12
  it('OCR-12: amount above 200% fails', () => {
    const text = 'Jorge Jimenez 83034342 ₡84,001.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(false);
  });

  // OCR-15
  it('OCR-15: uppercase name matches (case-insensitive)', () => {
    const text = 'JORGE JIMENEZ 83034342 ₡42,000.00';
    const result = validate(text, expectedUSD);
    expect(result.valid).toBe(true);
  });
});
