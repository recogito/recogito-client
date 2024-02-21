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

  experimentalCSSRenderer?: boolean;

  filter?: ((a: TextAnnotation) => boolean);

  style?: ((a: TextAnnotation) => DrawingStyle);

  onRendered?(): void;

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
      experimentalCSSRenderer={props.experimentalCSSRenderer}
      pdfUrl={downloadURL} 
      filter={props.filter}
      style={props.style}
      onRendered={props.onRendered} />
  )
  
}