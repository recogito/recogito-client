import { useEffect, useState } from 'react';
import { PDFAnnotator } from '@recogito/react-pdf-annotator';
import '@recogito/react-pdf-annotator/react-pdf-annotator.css';
import type { DocumentInTaggedContext } from 'src/Types';
import { getDownloadURL } from '@backend/storage';
import { supabase } from '@backend/supabaseBrowserClient';
import type { TextAnnotation } from '@recogito/react-text-annotator';
import type { DrawingStyle } from '@annotorious/react';

interface PDFViewerProps {

  document: DocumentInTaggedContext;

  style?: ((a: TextAnnotation) => DrawingStyle) 

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
      style={props.style} />
  )
  
}