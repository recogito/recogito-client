import { createInstance } from 'i18next';
import { initReactI18next } from 'react-i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { baseOptions, defaultLocale, supportedLocales } from './config';
import { loadNamespace } from './loaders';

// all routes are /[lang]/...; islands using this instance are client:only, so
// window is available
const getLanguage = () => {
  const lng =
    typeof window === 'undefined'
      ? undefined
      : window.location.pathname.split('/')[1];

  return lng && supportedLocales.includes(lng) ? lng : defaultLocale;
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
    maxRetries: 1,
  });

export default clientI18next;
