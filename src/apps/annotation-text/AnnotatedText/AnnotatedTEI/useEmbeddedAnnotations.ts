import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TextAnnotation, User } from '@recogito/react-text-annotator';
import type { EmbeddedLayer } from 'src/Types';
import type { DocumentNote } from '@components/AnnotationDesktop';

interface AnnotationList {

  layer: EmbeddedLayer;

  annotations: TextAnnotation[];

  notes: DocumentNote[]

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

// Helpers
const normalizeId = (id?: string | null) => id?.startsWith('#') ? id.substring(1) : id;

const parseDate = (date?: string | null) => date ? new Date(date) : undefined;

const parseTaxonomies = (elements: NodeListOf<Element>) => {
  const lookupTable: Record<string, string> = {};

  // We don't export nested taxonomies yet, but may in the future!
  const walkCategories = (categoryEl: Element) => {
    const childCategories = Array.from(categoryEl.children)
      .filter(child => child.tagName.toLowerCase() === 'category');

    if (childCategories.length === 0) {
      // Leaf node -> this is a tag
      const id = categoryEl.getAttribute('xml:id');
      const label = categoryEl.querySelector('catDesc');
        
      if (id && label)
            lookupTable[id] = label.textContent?.trim() || id;
      
      return;
    }

    childCategories.forEach(walkCategories);
  }

  // Start traversal from the root taxonomy element
  Array.from(elements).forEach(element => {
    walkCategories(element);
  });

  return lookupTable;
}

export const useEmbeddedTEIAnnotations = (xml?: string) => {

  const [annotationLists, setAnnotationLists] = useState<AnnotationList[]>([]);

  useEffect(() => {
    if (!xml) return;

    const parser = new DOMParser();

    const doc = parser.parseFromString(xml, 'text/xml');

    const standoffElements = doc.querySelectorAll('TEI > standOff');

    const taxonomyLookup = parseTaxonomies(doc.querySelectorAll('taxonomy'));

    // Helper
    const resolveTag = (id: string) => taxonomyLookup[id.startsWith('#') ? id.substring(1) : id] || id;

    const annotationLists = Array.from(standoffElements).reduce<AnnotationList[]>((lists, standoffEl, idx) => {
      const layerId =  standoffElements.length > 1 ? `tei_standoff_${idx + 1}` : 'tei_standoff';

      const layer = { 
        id: layerId, 
        name: standoffElements.length > 1 ? `TEI Standoff ${idx+1}` : 'TEI Standoff'
      };

      const annotationElements = standoffEl.querySelectorAll('listAnnotation > annotation');

      const annotationsAndNotes = Array.from(annotationElements).map(el => {
        const id = el.getAttribute('xml:id');

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

        const tags: string[] = el.hasAttribute('ana') 
          ? el.getAttribute('ana')!.split(' ').map(resolveTag)
          : [];
          
        const created = changes.find(c => c.status === 'created');
        const updated = changes.find(c => c.status === 'modified');

        const [startSelector, endSelector] = el.getAttribute('target')
          ? el.getAttribute('target')!.split(' ') as [string, string]
          : [undefined, undefined];

        return {
          id,
          layer_id: layerId,
          target: {
            annotation: id,
            creator: created ? users.find(u => u.id === created.who) : undefined,
            created: created?.when,
            updatedBy: updated ? users.find(u => u.id === updated.who) : undefined,
            updated: updated?.when,
            selector: (startSelector && endSelector) ? [{
              startSelector: {
                type: 'XPathSelector',
                value: startSelector
              },
              endSelector: {
                type: 'XPathSelector',
                value: endSelector
              }
            }] : undefined
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
              value: tag,
              // Maybe not the greatest convention - but we'll attribute
              // all tags to the annotation creator. The issue: we current don't have a
              // mechanism implemented in our TEI export that associates users with
              // tags. (I'm not sure there even is a mechansim in TEI!)
              creator: created ? users.find(u => u.id === created.who) : undefined
            }))
          ]
        } as unknown as TextAnnotation
      });

      const annotations = annotationsAndNotes.filter(a => a.target.selector) as TextAnnotation[];
      const notes = annotationsAndNotes.filter(a => !a.target.selector) as unknown as DocumentNote[];

      return [...lists, { layer, annotations, notes }];
    }, []);

    setAnnotationLists(annotationLists);
  }, [xml]);

  const annotations = useMemo(() => 
    annotationLists.reduce<TextAnnotation[]>((all, list) => ([...all, ...list.annotations]), []), [annotationLists]); 

  const notes = useMemo(() => 
    annotationLists.reduce<DocumentNote[]>((all, list) => ([...all, ...list.notes]), []), [annotationLists]);

  const layers = useMemo(() => annotationLists.map(l => l.layer), [annotationLists]);

  return { layers, annotations, notes };
  
}