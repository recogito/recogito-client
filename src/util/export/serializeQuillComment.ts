import type { Delta, Op } from 'quill/core';

export const serializeQuill = (value: string) => {
  const input = JSON.parse(value) as Delta;

  let serialized = '';

  input.ops?.forEach((op: Op) => {
    if (!op.insert) return;

    if (typeof op.insert === "string") {
      serialized += op.insert;
    } else if ('image' in op.insert) {
      serialized += op.insert.image;
    } else if ('video' in op.insert) {
      serialized += op.insert.video;
    }
  });

  return serialized.trim();
}