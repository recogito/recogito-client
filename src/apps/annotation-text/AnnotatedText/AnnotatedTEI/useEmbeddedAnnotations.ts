import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
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

    const annotationLayers = Array.from(standoffElements).reduce<ListAnnotation[]>((lists, standoffEl, idx) => {
      const annotationsElements = standoffEl.querySelectorAll('listAnnotation > annotation');

      const annotations = Array.from(annotationsElements).map(el => {
        const id = el.getAttribute('xml:id');
        const [startSelector, endSelector] = el.getAttribute('target')?.split(' ') as [string, string];

        const noteElements = Array.from(el.querySelectorAll('note')).map(node => node.textContent);

        console.log(noteElements);

        return {
          id,
          layer_id: `TEI Standoff ${idx + 1}`,
          target: {
            annotation: id,
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
          bodies: noteElements.map(value => ({
            id: uuidv4(),
            annotation: id,
            value
          }))
        } as unknown as TextAnnotation
      });

      // Just a hack
      setAnnotations(annotations);

      return [...lists, { annotations } as ListAnnotation];
    }, []);
  }, [xml]);

  return annotations;
  
}