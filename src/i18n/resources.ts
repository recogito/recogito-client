import type { Resource } from 'i18next';
import { defaultLocale } from './config';

// NOTE: locale JSON is bundled at build time, so this works in SSR and in
// serverless functions without filesystem access
const localeFiles = import.meta.glob<Record<string, string>>(
  '/src/locales/*/*.json',
  { eager: true, import: 'default' }
);

export const resources: Resource = {};

for (const [path, translations] of Object.entries(localeFiles)) {
  const [lng, file] = path.split('/').slice(-2);
  const ns = file.replace(/\.json$/, '');

  resources[lng] = { ...resources[lng], [ns]: translations };
}

// the namespaces an SSR'd island renders, plus the fallback locale's copies, so
// the first render (server and client) has every string without a load
export const pickResources = (lng: string, namespaces: string[]): Resource => {
  const picked: Resource = {};

  for (const l of new Set([lng, defaultLocale])) {
    picked[l] = Object.fromEntries(
      namespaces
        .filter((ns) => resources[l]?.[ns])
        .map((ns) => [ns, resources[l][ns]])
    );
  }

  return picked;
};
