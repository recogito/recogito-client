/**
 * Builds a URL with the passed baseURL and search/hash parameters.
 *
 * @param baseUrl
 * @param search
 * @param hash
 */
export const buildURL = (baseUrl: string, search: URLSearchParams, hash: URLSearchParams) => {
  let url = baseUrl;

  if (search) {
    url = `${url}?${search.toString()}`;
  }

  if (hash) {
    url = `${url}#${hash.toString()}`;
  }

  return url;
};

/**
 * Returns the hash parameter value with the passed name for the current URL.
 *
 * @param name
 */
export const getHashParameter = (name: string) => {
  const parameters = getHashParameters();
  return parameters.get(name);
};

/**
 * Returns the hash parameters for the current URL.
 */
export const getHashParameters = () => new URLSearchParams(window.location.hash.substring(1));

/**
 * Returns the search parameter value with the passed name for the current URL.
 *
 * @param name
 */
export const getSearchParameter = (name: string) => {
  const parameters = getSearchParameters();
  return parameters.get(name);
};

/**
 * Returns the search parameters for the current URL.
 */
export const getSearchParameters = () => new URLSearchParams(window.location.search.substring(1));

