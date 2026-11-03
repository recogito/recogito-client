import { createInstance, type Resource } from 'i18next';
import resourcesToBackend from 'i18next-resources-to-backend';
import { baseOptions } from './config';
import { loadNamespace } from './loaders';

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
    maxRetries: 1,
  });

  return instance;
};
