import { DOMParser } from 'linkedom';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

const getLastChangedAt = (annotation: SupabaseAnnotation) => {
  const elements = [ annotation.target, ...annotation.bodies ];
  const timestamped = elements.filter(el => el.created || el.updated);

  if (timestamped.length > 0) {
    timestamped.sort((a, b) => 
      (a.updated || a.created)!.getTime() - (b.updated || b.created)!.getTime());

    return timestamped[0];
  }
}

export const mergeAnnotations = (xml: string, annotations: SupabaseAnnotation[]): string => {

  const document = (new DOMParser).parseFromString(xml, 'text/xml');

  // https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-standOff.html
  const standOffEl = document.createElement('standOff');

  const listAnnotationEl = document.createElement('listAnnotation');
  standOffEl.appendChild(listAnnotationEl);

  // Helper
  const createChangeEl = (change: string, timestamp: Date, by?: string) => {
    const changeEl = document.createElement('change');
    changeEl.setAttribute('status', change);
    changeEl.setAttribute('when', timestamp.toISOString());

    if (by)
      changeEl.setAttribute('who', `#${by}`);

    return changeEl;
  }

  annotations.forEach(a => {
    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html
    const annotationEl = document.createElement('annotation');
    annotationEl.setAttribute('xml:id', `#${a.id}`);

    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html#tei_att.target
    // @ts-ignore
    const { startSelector, endSelector } = a.target.selector;
    annotationEl.setAttribute('target', `${startSelector.value} ${endSelector.value}`);

    // Add creation and last update timestamp
    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/examples-annotation.html
    // <revisionDesc>
    //   <change status="created"
    //     when="2020-05-21T13:59:00Z" who="#ed"/>
    //   <change status="modified"
    //     when="2020-05-21T19:48:00Z" who="#ed"/>
    // </revisionDesc>
    const revisionDescEl = document.createElement('revisionDesc');

    // Created
    if  (a.target.created && a.target.creator)
      revisionDescEl.appendChild(createChangeEl('created', a.target.created, a.target.creator.name));

    // Get most recent change
    const lastChanged = getLastChangedAt(a);
    if (lastChanged) {
      const isUpdate = Boolean(lastChanged.updated);

      revisionDescEl.appendChild(createChangeEl(
        'modified', 
        (isUpdate ? lastChanged.updated : lastChanged.created)!, 
        isUpdate ? lastChanged.updatedBy?.name : lastChanged.creator?.name))
    }

    annotationEl.appendChild(revisionDescEl);

    // Add one <note> for each comment
    const comments = a.bodies.filter(b => b.purpose === 'commenting');
    comments.forEach(b => {
      const noteEl = document.createElement('note');
      noteEl.appendChild(document.createTextNode(b.value));
      annotationEl.appendChild(noteEl);
    });

    // If there are any tags, create one rs element and add them as the ana attribute
    const tags = a.bodies.filter(b => b.purpose === 'tagging');
    if (tags.length > 0) {
      const rsEl = document.createElement('rs');
      rsEl.setAttribute('ana', tags.map(b => b.value).join(' '))
      annotationEl.appendChild(rsEl);
    }

    listAnnotationEl.appendChild(annotationEl);
  });

  let teiHeader = document.querySelector('teiHeader');
  if (!teiHeader) {
    teiHeader = document.createElement('teiHeader');
    document.querySelector('TEI').prepend(teiHeader);
  }
  
  teiHeader.appendChild(standOffEl);
  
  return document.toString();
}