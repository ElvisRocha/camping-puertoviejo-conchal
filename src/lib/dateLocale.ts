import { es, enUS, fr, de, zhCN, ru, Locale } from 'date-fns/locale';
import { format } from 'date-fns';

const locales: Record<string, Locale> = {
  es: es,
  en: enUS,
  fr: fr,
  de: de,
  zh: zhCN,
  ru: ru,
};

const weekStartsOnMap: Record<string, 0 | 1> = {
  es: 1, // Monday
  en: 0, // Sunday
  fr: 1, // Monday
  de: 1, // Monday
  zh: 1, // Monday
  ru: 1, // Monday
};

export const getDateLocale = (lang: string): Locale => {
  return locales[lang] || enUS;
};

export const getWeekStartsOn = (lang: string): 0 | 1 => {
  return weekStartsOnMap[lang] ?? 0;
};

export const formatLocalizedDate = (
  date: Date | string,
  formatStr: string = 'PPP',
  lang: string = 'en'
): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, formatStr, { locale: getDateLocale(lang) });
};
