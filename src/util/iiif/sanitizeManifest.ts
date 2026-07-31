/**
 * Some real-world IIIF manifests omit fields that the IIIF Presentation
 * spec (via @allmaps/iiif-parser Zod schemas) require.
 *
 * This util mutates the given manifest object in place to sanitize unused
 * but invalid fields from any otherwise valid manifest.
 */
export const sanitizeManifest = (data: any) => {
  if (data && Array.isArray(data.homepage)) {
    // drop homepage entries missing the required label property (for Getty manifests).
    // we don't use it and it causes a Zod error in @allmaps/iiif-parser
    data.homepage = data.homepage.filter((h: any) => h && h.label);

    // if nothing valid remains, remove the field entirely
    if (data.homepage.length === 0) {
      delete data.homepage;
    }
  }

  return data;
};
