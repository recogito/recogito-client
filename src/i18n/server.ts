import { createInstance } from 'i18next';
import { baseOptions } from './config';
import { resources } from './resources';

// server-side (astro) i18next instance
export async function getFixedT(locale?: string, namespaces?: string[]) {
  const newInstance = createInstance();

  return newInstance.init({
    ...baseOptions,
    lng: locale,
    ns: namespaces,
    resources,
    interpolation: { escapeValue: true },
  });
}
