import { createInstance, type Resource } from 'i18next';
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

// all routes are /[lang]/...; islands using this instance are client:only, so
// window is available
const getLanguage = () => {
  const lng =
    typeof window === 'undefined'
      ? undefined
      : window.location.pathname.split('/')[1];

  return lng && supportedLocales.includes(lng) ? lng : defaultLocale;
};

// props a client:load island takes from its page
export interface PreloadedI18nProps {
  lng: string;

  resources: Resource;
}

// per-island instance for client:load islands: the page passes the
// namespaces it renders (see pickResources), so the server render and first
// client render match. Other namespaces still load on demand.
export const createClientI18n = (lng: string, resources: Resource) => {
  const instance = createInstance();

  // NOTE: no initReactI18next; it sets a module-global instance, which would be
  // shared across requests on the server. I18nextProvider supplies this one.
  instance.use(resourcesToBackend(loadNamespace)).init({
    ...baseOptions,
    lng,
    ns: Object.keys(resources[lng] ?? {}),
    resources,
    partialBundledLanguages: true,
    initAsync: false,
  });

  return instance;
};

// render-time i18next instance for client:only islands
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
