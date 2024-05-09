import type { Delta } from 'quill/core';

export const isEmpty = (value: Delta) => {
  if (value.ops.length === 0) return true;

  return value.ops.every(op => !(op.insert?.toString() || '').trim());
}