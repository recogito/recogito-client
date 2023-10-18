import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { DOMParser } from 'linkedom';

/**
 * Experimental!
 */
export const mergeAnnotations = (xml: string, annotations: SupabaseAnnotation[]): string => {

  const document = (new DOMParser).parseFromString(xml, 'text/xml');

  // https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-standOff.html
  const standOffEl = document.createElement('standOff');

  annotations.forEach(a => {
    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html
    const annotationEl = document.createElement('annotation');
    annotationEl.setAttribute('xml:id', a.id);

    a.bodies.forEach(b => {
      // Just a hack for now
      const noteEl = document.createElement('note');
      noteEl.appendChild(document.createTextNode(b.value));
      annotationEl.appendChild(noteEl);
    });

    standOffEl.appendChild(annotationEl);
  });

  document.querySelector('teiHeader').appendChild(standOffEl);
  
  return document.toString();
}