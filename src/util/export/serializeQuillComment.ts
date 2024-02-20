import type { DeltaOperation } from 'quill';

export const serializeQuill = (value: string) => {
  const input = JSON.parse(value);

  let serialized = '';

  input.ops?.forEach((op: DeltaOperation) => {
    if (typeof op.insert === "string") {
      serialized += op.insert;
    } else if ('image' in op.insert) {
      serialized += op.insert.image;
    } else if ('video' in op.insert) {
      serialized += op.insert.video;
    }
  })

  return serialized.trim();
}