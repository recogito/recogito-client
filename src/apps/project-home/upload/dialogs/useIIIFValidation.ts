import { useEffect, useState } from 'react';
import { Cozy } from 'cozy-iiif';

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

  isValid: boolean;

  result?: {

    type: 'image' | 'manifest' | 'collection';

    majorVersion: number;
  
    label?: string;
  
  }

  error?: 'invalid_url' | 'not_https' | 'fetch_error' | 'invalid_manifest' | 'unsupported_manifest_type';

}

export const validateIIIF = (url: string, locale: string): Promise<ValidationResult> => {
  if (isValidHTTPSURL(url)) {
    return fetch(url)
      .then((response) => response.json())
      .then(data => {
          try {
            const parsed = Cozy.parse(data, url);

            if (parsed.type === 'iiif-image') {
              // Image API v1/2/3
              return {
                isValid: true,
                result: {
                  type: 'image',
                  majorVersion:
                    'majorVersion' in parsed.resource ? parsed.resource.majorVersion : 0
                }
              } as ValidationResult;
            } else if (parsed.type === 'manifest') {
              // Presentation API v1/2/3
              const label = parsed.resource.getLabel(locale);
              return {
                isValid: true,
                result: {
                  type: 'manifest',
                  majorVersion: parsed.resource.majorVersion,
                  label
                }
              } as ValidationResult;
            } else if (parsed.type === 'collection') {
              // Collection manifest... unsupported!
              return {
                isValid: false,
                result: {
                  type: 'collection',
                  majorVersion: parsed.resource.majorVersion
                },
                error: 'unsupported_manifest_type'
              } as ValidationResult;
            } else {
              return {
                isValid: false,
                error: 'invalid_manifest'
              } as ValidationResult;
            }
          } catch (error) {
            // Exception during parse - return the error
            console.error(error);
            return {
              isValid: false,
              error: 'invalid_manifest'
            } as ValidationResult;
          }
        })
        .catch(error => {
          console.error(error);

          // HTTP fetch or connection error
          return {
            isValid: false,
            error: 'fetch_error'
          };
        });
  } else {
    return Promise.resolve({
      isValid: false,
      error: url.startsWith('https') ? 'invalid_url' : 'not_https'
    });
  } 
}

export const useIIIFValidation = (url: string, locale: string) => {

  const [isFetching, setIsFetching] = useState(false);

  const [lastResult, setLastResult] = useState<ValidationResult | undefined>();

  const validate = (url: string) => {
    setIsFetching(true);

    validateIIIF(url, locale).then(result => {
      setLastResult(result);
      setIsFetching(false);
    });
  }

  useEffect(() => validate(url), [url])

  return {
    isFetching,
    isValid: lastResult?.isValid,
    lastError: lastResult?.error,
    result: lastResult?.result,
    validate
  }

}