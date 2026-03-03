import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/locales/en.json';
import es from '@/locales/es.json';
import fr from '@/locales/fr.json';
import de from '@/locales/de.json';
import zh from '@/locales/zh.json';
import ru from '@/locales/ru.json';

const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
  de: { translation: de },
  zh: { translation: zh },
  ru: { translation: ru },
};

// Guard localStorage access: iOS Safari private mode and browsers with strict
// storage policies can throw a SecurityError on getItem/setItem calls.
const savedLanguage = (() => {
  try {
    return localStorage.getItem('language');
  } catch {
    return null;
  }
})();

i18n.use(initReactI18next).init({
  resources,
  lng: savedLanguage || 'es',
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;

export const languages = [
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'zh', name: '中文', flag: '🇨🇳' },
  { code: 'ru', name: 'Русский', flag: '🇷🇺' },
];
