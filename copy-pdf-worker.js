import fs from 'fs';

const path = './node_modules/@recogito/react-pdf-annotator/dist/pdf.worker.min.mjs';
fs.copyFileSync(path, './public/pdf.worker.min.mjs');