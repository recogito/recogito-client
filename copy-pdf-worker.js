import fs from 'fs';
import path from 'path';

console.log('Copying PDF.js worker files to /public');

const BASE = './node_modules/@recogito/react-pdf-annotator/dist';

const FILES = [
  `${BASE}/pdf.worker.min.mjs`,
  `${BASE}/jbig2.wasm`,
  `${BASE}/jbig2_nowasm_fallback.js`
]

try {
  FILES.forEach(filepath =>
    fs.copyFileSync(filepath, `./public/${path.basename(filepath)}`));
} catch (error) {
  console.error('Error copying PDF.js worker files');
  console.error(error);
}