import { useEffect, useState } from 'react';
import { IIIF } from '@allmaps/iiif-parser';

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
     '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
     '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
     '(\\?[;&a-z\\d%_.~+=-]*)?$','i'); // query string

  return pattern.test(str);
}

interface ValidationResult {

  type: 'image' | 'manifest' | string;

  majorVersion: number;

}

type Error = 'invalid_url' | 'fetch_error' | 'invalid_manifest' | 'unsupported_manifest_type';

export const useIIIFValidation = (url: string) => {

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
              setLastError(undefined);
              setIsValid(true);
              setResult({ type: 'manifest', majorVersion: parsed.majorVersion });
            } else {
              setLastError('unsupported_manifest_type');
              setIsValid(false);
              setResult({ type: parsed.type, majorVersion: parsed.majorVersion });
            }
          } catch {
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