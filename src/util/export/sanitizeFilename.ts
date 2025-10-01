import sanitize from 'sanitize-filename';
import slugify from 'slugify';

/** Make sure we don't have unsafe or unicode characters in download filenames **/
export const sanitizeFilename = (unsafe: string) => {
  const slugified = slugify(unsafe || '', {
    replacement: '_', 
    remove: /[*+~.()'"!:@]/g, 
    lower: false,
    strict: true, 
    locale: 'en'
  });

  // Additional safety net to remove or replace non-ASCII characters
  const asciiOnly = slugified.replace(/[^\x20-\x7F]/g, '_');

  return sanitize(asciiOnly);
}