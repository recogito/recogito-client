import { i18n } from 'astro:config/server';
import { createInstance } from 'i18next';
import Backend from 'i18next-fs-backend';

// server-side (astro) i18next instance
export async function getFixedT(locale?: string, namespaces?: string[]) {
  const newInstance = createInstance();

  return newInstance.use(Backend).init({
    lng: locale,
    // NOTE: These are defined in astro.config.mjs; fallback values are just to make TS happy
    fallbackLng: i18n?.defaultLocale || 'en',
    supportedLngs: (i18n?.locales as Array<string>) || ['en'],
    ns: namespaces,
    defaultNS: 'common',
    backend: {
      loadPath: './public/locales/{{lng}}/{{ns}}.json',
    },
  });
}
