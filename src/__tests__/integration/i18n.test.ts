import { describe, it, expect } from 'vitest';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import zh from '@/locales/zh.json';
import ru from '@/locales/ru.json';

function flattenKeys(obj: Record<string, any>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([key, value]) => {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return flattenKeys(value, fullKey);
    }
    return [fullKey];
  });
}

function getFlatValues(obj: Record<string, any>, prefix = ''): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, getFlatValues(value, fullKey));
    } else {
      result[fullKey] = String(value);
    }
  }
  return result;
}

const enKeys = flattenKeys(en);
const translations: Record<string, Record<string, any>> = { es, fr, de, zh, ru };

describe('i18n Translation Completeness', () => {
  // I18N-01 to I18N-05
  for (const [lang, translation] of Object.entries(translations)) {
    it(`I18N: all EN keys exist in ${lang.toUpperCase()}`, () => {
      const langKeys = flattenKeys(translation);
      const missing = enKeys.filter((key) => !langKeys.includes(key));
      if (missing.length > 0) {
        console.warn(`Missing keys in ${lang}:`, missing.slice(0, 10));
      }
      expect(missing.length).toBe(0);
    });
  }

  // I18N-06: No empty values
  it('I18N-06: no empty string values in any language', () => {
    const allTranslations = { en, es, fr, de, zh, ru };
    const emptyFound: string[] = [];

    for (const [lang, translation] of Object.entries(allTranslations)) {
      const flat = getFlatValues(translation);
      for (const [key, value] of Object.entries(flat)) {
        if (value.trim() === '') {
          emptyFound.push(`${lang}:${key}`);
        }
      }
    }

    if (emptyFound.length > 0) {
      console.warn('Empty translation values:', emptyFound.slice(0, 10));
    }
    expect(emptyFound.length).toBe(0);
  });

  // I18N-07: Booking step labels exist in all languages
  it('I18N-07: booking step labels translated', () => {
    const stepKeys = [
      'booking.step1.title',
      'booking.step2.title',
      'booking.step3.title',
      'booking.step4.title',
      'booking.step5.title',
    ];
    const allTranslations = { en, es, fr, de, zh, ru };
    for (const [lang, translation] of Object.entries(allTranslations)) {
      const langKeys = flattenKeys(translation);
      for (const key of stepKeys) {
        expect(langKeys, `${lang} missing ${key}`).toContain(key);
      }
    }
  });
});
