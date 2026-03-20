import { describe, it, expect } from 'vitest';
import { getDateLocale, getWeekStartsOn, formatLocalizedDate } from '@/lib/dateLocale';

describe('Date Locale Utilities', () => {
  // DT-05
  it('DT-05: Spanish week starts on Monday (1)', () => {
    expect(getWeekStartsOn('es')).toBe(1);
  });

  // DT-06
  it('DT-06: English week starts on Sunday (0)', () => {
    expect(getWeekStartsOn('en')).toBe(0);
  });

  it('French, German, Chinese, Russian all start on Monday', () => {
    expect(getWeekStartsOn('fr')).toBe(1);
    expect(getWeekStartsOn('de')).toBe(1);
    expect(getWeekStartsOn('zh')).toBe(1);
    expect(getWeekStartsOn('ru')).toBe(1);
  });

  it('unknown language defaults to Sunday (0)', () => {
    expect(getWeekStartsOn('xx')).toBe(0);
  });

  it('getDateLocale returns a locale object', () => {
    const locale = getDateLocale('es');
    expect(locale).toBeDefined();
    expect(locale.code).toBe('es');
  });

  it('formatLocalizedDate formats a date', () => {
    const date = new Date(2026, 0, 15); // Jan 15, 2026
    const result = formatLocalizedDate(date, 'yyyy-MM-dd', 'en');
    expect(result).toBe('2026-01-15');
  });

  it('formatLocalizedDate accepts string date', () => {
    const result = formatLocalizedDate('2026-06-01', 'yyyy-MM-dd', 'en');
    expect(result).toBe('2026-06-01');
  });
});
