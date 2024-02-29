import { useEffect, useState } from 'react';
import { IIIF, LanguageString } from '@allmaps/iiif-parser';
import type { Translations } from 'src/Types';

/**
 * Some basic sanity checking on the URL string
 */
const isValidHTTPSURL = (str: string) => {
  if (!str) return false;

  if (!str.startsWith('https://'))
    return false;

  const pattern = 
    new RegExp('^https:\\/\\/' + // HTTPS protocol
     '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
     '((\\d{1,3}\\.){3}\\d{1,3}))'); // OR ip (v4) address

  return pattern.test(str);
}

interface ValidationResult {

  type: 'image' | 'manifest' | 'collection';

  majorVersion: number;

  label?: string;

}

type Error = 'invalid_url' | 'fetch_error' | 'invalid_manifest' | 'unsupported_manifest_type';

const getDefaultLabel = (dict: LanguageString | undefined, lang: string) => {
  if (!dict)
    return;

  const localized = dict[lang];
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

export const useIIIFValidation = (url: string, i18n: Translations) => {

  const [isFetching, setIsFetching] = useState(false);

  const [lastError, setLastError] = useState<Error | undefined>();

  const [isValid, setIsValid] = useState(false);

  const [result, setResult] = useState<ValidationResult | undefined>();

  const validate = (url: string) => {
    if (isValidHTTPSURL(url)) {
      setIsFetching(true);

      fetch(url)
        .then((response) => response.json())
        .then(data => {
          setIsFetching(false);

          try {
            const parsed = IIIF.parse(data);

            if (parsed.type === 'image') {
              setLastError(undefined);
              setIsValid(true);
              setResult({ type: 'image', majorVersion: parsed.majorVersion });
            } else if (parsed.type === 'manifest') {

              const label = getDefaultLabel(parsed.label, i18n.lang);

              setLastError(undefined);
              setIsValid(true);
              setResult({ type: 'manifest', majorVersion: parsed.majorVersion, label });
            } else {
              setLastError('unsupported_manifest_type');
              setIsValid(false);
              setResult({ type: parsed.type, majorVersion: parsed.majorVersion });
            }
          } catch (error) {
            console.error(error);
            setLastError('invalid_manifest');
            setIsValid(false);
            setResult(undefined);
          }
        })
        .catch(() => {
          setIsFetching(false);
          setLastError('fetch_error');
          setIsValid(false);
          setResult(undefined);
        });
    } else {
      setIsFetching(false);
      setLastError('invalid_url');
      setIsValid(false);
      setResult(undefined);
    }
  }

  useEffect(() => validate(url), [url])

  return {
    isFetching,
    isValid,
    lastError,
    result,
    validate
  }

}