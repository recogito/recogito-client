/**
 * Builds a URL with the passed baseURL and search/hash parameters.
 *
 * @param baseUrl
 * @param search
 * @param hash
 */
export const buildURL = (baseUrl, search, hash) => {
  let url = baseUrl;

  if (search) {
    const searchParams = new URLSearchParams(search);
    url = `${url}?${searchParams.toString()}`;
  }

  if (hash) {
    const hashParams = new URLSearchParams(hash);
    url = `${url}#${hashParams.toString()}`;
  }

  return url;
};

/**
 * Returns the hash parameter value with the passed name for the current URL.
 *
 * @param name
 */
export const getHashParameter = (name) => {
  const parameters = getHashParameters();
  return parameters.get(name);
};

/**
 * Returns the hash parameters for the current URL.
 */
export const getHashParameters = () => new URLSearchParams(window.location.hash.substring(1));
