import { describe, it, expect } from 'vitest';
import { formatDualPrice, formatDualPriceInt } from '@/lib/priceFormat';

describe('Currency Formatting', () => {
  // CF-01
  it('CF-01: formatDualPrice(84) produces correct dual format', () => {
    expect(formatDualPrice(84)).toBe('₡42,000.00 ó $84.00');
  });

  // CF-02
  it('CF-02: formatDualPrice(0) handles zero', () => {
    expect(formatDualPrice(0)).toBe('₡0.00 ó $0.00');
  });

  // CF-03
  it('CF-03: formatDualPriceInt(14) omits decimal for USD', () => {
    expect(formatDualPriceInt(14)).toBe('₡7,000.00 ó $14');
  });

  // CF-04
  it('CF-04: custom connector "or" works', () => {
    expect(formatDualPrice(84, 'or')).toBe('₡42,000.00 or $84.00');
  });

  // CF-05
  it('CF-05: large numbers format correctly', () => {
    const result = formatDualPrice(5000);
    // USD uses toFixed(2) without thousands separator - that's by design
    expect(result).toBe('₡2,500,000.00 ó $5000.00');
  });
});
