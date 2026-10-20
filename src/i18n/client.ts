import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { baseOptions, defaultLocale, supportedLocales } from './config';

// one lazily-loaded chunk per locale file, so namespaces load on demand
// without a relative fetch that breaks during SSR
const localeLoaders = import.meta.glob<Record<string, string>>(
  '/src/locales/*/*.json',
  { import: 'default' }
);

const loadNamespace = (lng: string, ns: string) => {
  const load = localeLoaders[`/src/locales/${lng}/${ns}.json`];
  return load
    ? load()
    : Promise.reject(new Error(`Missing locale file: ${lng}/${ns}`));
};

// all routes are /[lang]/...; islands are client:only, so window is available
const getLanguage = () => {
  const lng =
    typeof window === 'undefined'
      ? undefined
      : window.location.pathname.split('/')[1];

  return lng && supportedLocales.includes(lng) ? lng : defaultLocale;
};

// render-time i18next instance
const clientI18next = createInstance();

clientI18next
  .use(resourcesToBackend(loadNamespace))
  .use(initReactI18next)
  .init({
    ...baseOptions,
    lng: getLanguage(),
    ns: [],
  });

export default clientI18next;
