import type { LanguageString } from '@allmaps/iiif-parser';

export const getResourceLabel = (dict: LanguageString | undefined, lang?: string) => {
  if (!dict) return;

  const localized = lang ? dict[lang] : undefined;
  if (localized) {
    return localized[0];
  } else {
    // Fallback #1
    const en = dict['en'];
    if (en) {
      return en[0];
    } else {
      // Fallback #2
      const values = Object.values(dict).reduce<string[]>((flattened, value) => {
        return Array.isArray(value) ? [...flattened, ...value] : [...flattened, value]
      }, []);

      return values.length > 0 ? values[0] : undefined;
    }
  }
}