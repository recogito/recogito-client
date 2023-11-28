import type { DeltaOperation } from 'quill';

export const serializeQuill = (value: string) => {
  const input = JSON.parse(value);

  let serialized = '';

  input.ops?.forEach((op: DeltaOperation) => {
    if (typeof op.insert === "string") {
      serialized += op.insert;
    }
  })

  return serialized;
}