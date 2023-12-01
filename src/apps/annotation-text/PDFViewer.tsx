import { useEffect, useState } from 'react';
import { PDFAnnotator } from '@recogito/react-pdf-annotator';
import type { DocumentInTaggedContext } from 'src/Types';
import { getDownloadURL } from '@backend/storage';
import { supabase } from '@backend/supabaseBrowserClient';
import type { TextAnnotation } from '@recogito/react-text-annotator';
import type { DrawingStyle } from '@annotorious/react';

import '@recogito/react-pdf-annotator/react-pdf-annotator.css';

interface PDFViewerProps {

  document: DocumentInTaggedContext;

  filter?: ((a: TextAnnotation) => boolean);

  style?: ((a: TextAnnotation) => DrawingStyle);

  onError?(): void;

}

export const PDFViewer = (props: PDFViewerProps) => {

  const [downloadURL, setDownloadURL] = useState<string | undefined>();

  useEffect(() => {
    getDownloadURL(supabase, props.document.id)
      .then(setDownloadURL)
      .catch(() => props.onError && props.onError());
  }, []);

  return downloadURL && (
    <PDFAnnotator 
      pdfUrl={downloadURL} 
      filter={props.filter}
      style={props.style} />
  )
  
}