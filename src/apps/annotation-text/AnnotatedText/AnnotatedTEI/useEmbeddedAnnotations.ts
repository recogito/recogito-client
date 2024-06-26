import { useEffect, useState } from 'react';
import type { TextAnnotation } from '@recogito/react-text-annotator';

export const useEmbeddedTEIAnnotations = (xml?: string) => {

  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);

  useEffect(() => {
    if (!xml) return;

    const parser = new DOMParser();

    const doc = parser.parseFromString(xml, 'text/xml');

    const listAnnotationElements = doc.querySelectorAll('TEI > teiHeader > standOff > listAnnotation');

    listAnnotationElements.forEach(listAnnotation => {
      const annotations = listAnnotation.getElementsByTagName('annotation');

      // TODO
      for (let i = 0; i < annotations.length; i++)
        console.log(`  annotation ${i + 1}: ${annotations[i].textContent}`);
    });
  }, [xml]);

  return annotations;
  
}