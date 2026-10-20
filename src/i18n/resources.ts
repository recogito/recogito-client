import type { Resource } from 'i18next';

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
