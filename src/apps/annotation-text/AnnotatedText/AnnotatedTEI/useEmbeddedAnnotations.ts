import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TextAnnotation, User } from '@recogito/react-text-annotator';
import type { EmbeddedLayer } from 'src/Types';

interface AnnotationList {

  layer: EmbeddedLayer;

  annotations: TextAnnotation[];

}

interface Note {

  text: string;

  responsible?: User;

}

interface Change {

  who: string;

  when: Date;

  status: 'created' | 'modified';

}

// Shorthands
const normalizeId = (id?: string | null) => id?.startsWith('#') ? id.substring(1) : id;

const parseDate = (date?: string | null) => date ? new Date(date) : undefined;

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

        const changes = Array.from(el.querySelectorAll('revisionDesc > change')).map(el => ({
          who: normalizeId(el.getAttribute('who')),
          when: parseDate(el.getAttribute('when')),
          status: el.getAttribute('status')
        }) as Change);

        const users: User[] = Array.from(el.querySelectorAll('respStmt')).map(el => ({
          id: el.getAttribute('xml:id'),
          name: el.textContent
        }) as User);

        const notes: Note[] = Array.from(el.querySelectorAll('note')).map(noteEl => ({
          text: noteEl.textContent,
          responsible: users.find(u => u.id === normalizeId(noteEl.getAttribute('resp')))
        }) as Note);

        const tags: string[] = Array.from(el.querySelectorAll('rs[ana]'))
          .reduce<string[]>((all, el) => [...all, ...el.getAttribute('ana')!.split(' ')],[]);

        const created = changes.find(c => c.status === 'created');
        const updated = changes.find(c => c.status === 'modified');

        return {
          id,
          layer_id: layerId,
          target: {
            annotation: id,
            creator: created ? users.find(u => u.id === created.who) : undefined,
            created: created?.when,
            updatedBy: updated ? users.find(u => u.id === updated.who) : undefined,
            updated: updated?.when,
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
            ...notes.map(note => ({
              id: uuidv4(),
              annotation: id,
              value: note.text,
              creator: note.responsible
            })),
            ...tags.map(tag => ({
              id: uuidv4(),
              annotation: id,
              purpose: 'tagging',
              value: tag
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