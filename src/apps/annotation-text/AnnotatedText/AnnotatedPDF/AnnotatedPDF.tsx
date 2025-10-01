import { memo, useEffect, useState } from 'react';
import { PDFAnnotator } from '@recogito/react-pdf-annotator';
import type { DocumentWithContext } from 'src/Types';
import { getDownloadURL } from '@backend/storage';
import { supabase } from '@backend/supabaseBrowserClient';
import type { HighlightStyleExpression } from '@recogito/react-text-annotator';
import type { Filter } from '@annotorious/react';

import '@recogito/react-pdf-annotator/react-pdf-annotator.css';

interface AnnotatedPDFProps {

  document: DocumentWithContext;

  filter?: Filter;

  isLocked: boolean;

  style?: HighlightStyleExpression;

  onRendered?(): void;

  onError?(): void;

}

export const AnnotatedPDF = memo((props: AnnotatedPDFProps) => {

  const [downloadURL, setDownloadURL] = useState<string | undefined>();

  useEffect(() => {
    getDownloadURL(supabase, props.document.id)
      .then(setDownloadURL)
      .catch(() => props.onError && props.onError());
  }, []);

  return downloadURL && (
    <PDFAnnotator 
      pdfUrl={downloadURL} 
      annotatingEnabled={!props.isLocked}
      filter={props.filter}
      style={props.style}
      mergeHighlights={{ verticalTolerance: 8, horizontalTolerance: 25 }}
      onRendered={props.onRendered} />
  )
  
}, (prev, next) => { 
  return prev.document === next.document
    && prev.isLocked === next.isLocked
    && prev.filter === next.filter 
    && prev.style === next.style
    && prev.onError === next.onError
    && prev.onRendered === next.onRendered;
});