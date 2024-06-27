import { useEffect, useState } from 'react';
import type { TextAnnotation } from '@recogito/react-text-annotator';

interface ListAnnotation {

  annotations: TextAnnotation[];

}

export const useEmbeddedTEIAnnotations = (xml?: string) => {

  const [annotations, setAnnotations] = useState<TextAnnotation[]>([]);

  useEffect(() => {
    if (!xml) return;

    const parser = new DOMParser();

    const doc = parser.parseFromString(xml, 'text/xml');

    const standoffElements = doc.querySelectorAll('TEI > teiHeader > standOff');

    const annotationLayers = Array.from(standoffElements).reduce<ListAnnotation[]>((lists, standoffEl) => {
      const annotationsElements = standoffEl.querySelectorAll('listAnnotation > annotation');

      const annotations = Array.from(annotationsElements).map(el => {
        const id = el.getAttribute('xml:id');
        const [startSelector, endSelector] = el.getAttribute('target')?.split(' ') as [string, string];

        const noteElements = el.querySelectorAll('note');

        return {
          id: id?.replace('uid-', ''),
          layer_id: 'FOOBAR',
          target: {
            annotation: id?.replace('uid-', ''),
            selector: [{
              startSelector: {
                type: 'XPathSelector',
                value: startSelector
              },
              endSelector: {
                type: 'XPathSelector',
                value: endSelector
              }
            }]
          },
          bodies: []
        } as unknown as TextAnnotation
      });

      // Just a hack
      setAnnotations(annotations);

      return [...lists, { annotations } as ListAnnotation];
    }, []);
  }, [xml]);

  return annotations;
  
}