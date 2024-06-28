import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TextAnnotation } from '@recogito/react-text-annotator';
import type { EmbeddedLayer } from 'src/Types';

interface AnnotationList {

  layer: EmbeddedLayer;

  annotations: TextAnnotation[];

}

export const useEmbeddedTEIAnnotations = (xml?: string) => {

  const [annotationLists, setAnnotationLists] = useState<AnnotationList[]>([]);

  useEffect(() => {
    if (!xml) return;

    const parser = new DOMParser();

    const doc = parser.parseFromString(xml, 'text/xml');

    const standoffElements = doc.querySelectorAll('TEI > teiHeader > standOff');

    const annotationLists = Array.from(standoffElements).reduce<AnnotationList[]>((lists, standoffEl, idx) => {
      const layerId =  `tei_standoff_${idx + 1}`;

      const layer = { id: layerId, name: `TEI Standoff ${idx+1}`};

      const annotationElements = standoffEl.querySelectorAll('listAnnotation > annotation');
      const annotations = Array.from(annotationElements).map(el => {
        const id = el.getAttribute('xml:id');

        const [startSelector, endSelector] = el.getAttribute('target')?.split(' ') as [string, string];

        const notes = Array.from(el.querySelectorAll('note')).map(node => node.textContent);

        const tags = Array.from(el.querySelectorAll('rs[ana]')).reduce<string[]>((all, el) => [...all, ...el.getAttribute('ana')!.split(' ')],[]);

        return {
          id,
          layer_id: layerId,
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
          bodies: [
            ...notes.map(value => ({
              id: uuidv4(),
              annotation: id,
              value
            })),
            ...tags.map(value => ({
              id: uuidv4(),
              annotation: id,
              purpose: 'tagging',
              value
            }))
          ]
        } as unknown as TextAnnotation
      });

      return [...lists, { layer, annotations }];
    }, []);

    setAnnotationLists(annotationLists);
  }, [xml]);

  const annotations = useMemo(() => 
    annotationLists.reduce<TextAnnotation[]>((all, list) => ([...all, ...list.annotations]), []), [annotationLists]); 

  const layers = useMemo(() => annotationLists.map(l => l.layer), [annotationLists]);

  return { layers, annotations };
  
}