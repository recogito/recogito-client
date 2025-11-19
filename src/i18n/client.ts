import { i18n } from 'astro:config/client';
import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import BrowserLanguageDetector from 'i18next-browser-languagedetector';

// render-time i18next instance
const clientI18next = createInstance();

clientI18next
  .use(HttpBackend)
  .use(BrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    // NOTE: These are defined in astro.config.mjs; fallback values are just to make TS happy
    fallbackLng: i18n?.defaultLocale || 'en',
    supportedLngs: (i18n?.locales as Array<string>) || ['en'],
    ns: [],
    defaultNS: 'common',
    backend: {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
    },
    interpolation: { escapeValue: false },
    detection: {
      order: ['path'],
      lookupFromPathIndex: 0,
    },
  });

export default clientI18next;
