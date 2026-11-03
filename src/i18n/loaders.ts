// one lazily-loaded chunk per locale file, so namespaces load on demand
// without a relative fetch that breaks during SSR
const localeLoaders = import.meta.glob<Record<string, string>>(
  '/src/locales/*/*.json',
  { import: 'default' }
);

export const loadNamespace = (lng: string, ns: string) => {
  const load = localeLoaders[`/src/locales/${lng}/${ns}.json`];
  return load
    ? load()
    : Promise.reject(new Error(`Missing locale file: ${lng}/${ns}`));
};
