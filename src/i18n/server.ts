import { i18n } from 'src/i18n/config';
import { createInstance, type Resource } from 'i18next';

const localeFiles = import.meta.glob<Record<string, string>>(
  '/public/locales/*/*.json',
  { eager: true, import: 'default' }
);

const resources: Resource = {};

for (const [path, translations] of Object.entries(localeFiles)) {
  const [lng, file] = path.split('/').slice(-2);
  const ns = file.replace(/\.json$/, '');

  resources[lng] = { ...resources[lng], [ns]: translations };
}

// server-side (astro) i18next instance
export async function getFixedT(locale?: string, namespaces?: string[]) {
  const newInstance = createInstance();

  return newInstance.init({
    lng: locale,
    // NOTE: These are defined in astro.config.mjs; fallback values are just to make TS happy
    fallbackLng: i18n?.defaultLocale || 'en',
    supportedLngs: (i18n?.locales as Array<string>) || ['en'],
    ns: namespaces,
    defaultNS: 'common',
    resources,
  });
}
