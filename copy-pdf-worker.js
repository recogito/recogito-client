import fs from 'fs';

console.log('Copying pdf.worker.min.mjs to /public');

try {
  const path = './node_modules/@recogito/react-pdf-annotator/dist/pdf.worker.min.mjs';
  fs.copyFileSync(path, './public/pdf.worker.min.mjs');
} catch (error) {
  console.error('Error copying pdf.worker.min.mjs');
  console.error(error);
}