import type { DeltaStatic, DeltaOperation } from "quill";

export const quillToText = (input: DeltaStatic) => {
  let output = "";
  input.ops?.forEach((op: DeltaOperation) => {
    if(typeof op.insert === "string") {
      output += op.insert;
    }
  })

  return output;
}