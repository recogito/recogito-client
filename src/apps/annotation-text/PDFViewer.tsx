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
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <PDFAnnotator 
        pdfUrl={downloadURL} 
        filter={props.filter}
        style={props.style} />
    </div>
  )
  
}