import type { Delta } from 'quill/core';

export const isEmpty = (value: Delta) => {
  if (value.ops.length === 0) return true;

  return value.ops.every(op => !(op.insert?.toString() || '').trim());
}

export const isAnnotationLink = (str: string) => {

  try {
    const url = new URL(str);

    // Require same host and port
    if (url.hostname !== location.hostname)
      return false;

    if (url.port && location.port &&  url.port !== location.port)
      return false;

    // RegEx to match the /annotate/{uuid}/{uuid} format at the end of the URL
    const isAnnotationPath = /\/annotate\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    if (!isAnnotationPath.test(url.pathname))
      return false;

    // Check if there's a 'selected' UUID
    const hash = window.location.hash.slice(1);
    const params = new URLSearchParams(hash);
    const selected = params.get('selected');

    if (!selected)
      return false;

    const isUUID = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
    return isUUID.test(selected);
  } catch (error) {
    return false;
  }
}

export const getAnnotationShortLink = (str: string) => {
  const hash = window.location.hash.slice(1);
  const params = new URLSearchParams(hash);
  const uuid = params.get('selected')!;

  // Clip to only first two sections, for display
  return uuid.split('-').slice(0, 2).join('-');
}

/** Helper to split a string by another string - used to clip annotatinon links **/
export const splitStringBy = (toSplit: string, splitBy: string): { before: string, after: string } => {
  const idx = toSplit.indexOf(splitBy);

  // Not found - just return everything as BEFORE
  if (idx === -1)
    return { before: toSplit, after: '' };

  const before = toSplit.substring(0, idx);
  const after = toSplit.substring(idx + splitBy.length);

  return { before, after };
}