import type { Delta, Op } from 'quill/core';
import { QuillDeltaToHtmlConverter } from 'quill-delta-to-html'; 

export const quillToPlainText = (value: string) => {
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

export const quillToPDFRichText = (value: string) => {
  const input = JSON.parse(value) as Delta;

  const ops = input.ops.map(op => {
    // Links are not supported in PDF annotations - turn to plaintext
    if (op.attributes?.link) 
      return { insert: `${op.insert} ${op.attributes.link}` };

    // Images are not supported in PDF annotations
    if (typeof op.insert === 'object') {
      if ('image' in op.insert) {
        if (typeof op.insert.image === 'string') {
          if (op.insert.image.startsWith('data:'))
            // Remove inline base64 images
            return undefined; 
          else
            // If the image is via URL, add the URL instead
            return { insert: op.insert.image }
        }
      }

      // Video URL
      if ('video' in op.insert)
        return { insert: op.insert.video }
    }

    return op;
  }).filter(Boolean);

  const converter = new QuillDeltaToHtmlConverter(ops, {
    linkTarget: undefined,
    customTag: (format, op) => {
      if (format === 'bold') return 'b';
      if (format === 'italic') return 'i';
    }
  });

  return converter.convert();
}