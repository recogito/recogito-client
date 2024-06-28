import sanitize from 'sanitize-filename';
import slugify from 'slugify';

/** Make sure we don't have unsafe or unicode characters in download filenames **/
export const sanitizeFilename = (unsafe: string) => {
  const slugified = slugify(unsafe, {
    replacement: '_', 
    strict: true
  });

  return sanitize(slugified);
}