import { DOMParser } from 'linkedom';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { User } from '@annotorious/react';
import { serializeQuill } from '../serializeQuillComment';

/** Returns the target or body that was changed most recently **/
const getLastChangedAt = (annotation: SupabaseAnnotation) => {
  const elements = [ annotation.target, ...annotation.bodies ];
  const timestamped = elements.filter(el => el.created || el.updated);

  if (timestamped.length > 0) {
    timestamped.sort((a, b) => 
      (a.updated || a.created)!.getTime() - (b.updated || b.created)!.getTime());

    return timestamped[0];
  }
}

/** Returns the list of all distinct users that contributed to the annotation **/
const getContributors = (annotation: SupabaseAnnotation) => {
  const elements = [ annotation.target, ...annotation.bodies ];
  const withContributor = elements.filter(el => el.creator || el.updatedBy);

  return withContributor.reduce((distinct, el) => {
    const isNewCreator = 
      // Creator exists
      el.creator && 
      // Creator is not yet in 'distinct' array
      !distinct.find(user => user.id === el.creator?.id);

    const isNewContributor = 
      // Contributor exists
      el.updatedBy && 
      // Contributors is not yet in 'distinct' array
      !distinct.find(user => user.id === el.creator?.id) &&
      // Contributor is not the same as Creator
      el.updatedBy.id !== el.creator?.id;

    if (isNewCreator && isNewContributor)
      return [...distinct, el.creator!, el.updatedBy!];
    else if (isNewCreator) 
      return [...distinct, el.creator!]
    else if (isNewContributor)
      return [...distinct, el.updatedBy!]
    else
      return distinct;
  }, [] as User[]);
}

export const mergeAnnotations = (xml: string, annotations: SupabaseAnnotation[]): string => {

  const document = (new DOMParser).parseFromString(xml, 'text/xml');

  // https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-standOff.html
  const standOffEl = document.createElement('standOff');

  const listAnnotationEl = document.createElement('listAnnotation');
  standOffEl.appendChild(listAnnotationEl);

  // Helpers
  const createChangeEl = (change: string, timestamp: Date, by?: string) => {
    const changeEl = document.createElement('change');
    changeEl.setAttribute('status', change);
    changeEl.setAttribute('when', timestamp.toISOString());

    if (by)
      changeEl.setAttribute('who', `#uid-${by}`);

    return changeEl;
  }

  const createRespStmtEl = (user: User) => {
    const respStmtEl = document.createElement('respStmt');
    respStmtEl.setAttribute('xml:id', `uid-${user.id}`);
    
    const nameEl = document.createElement('name');
    nameEl.innerHTML = user.name || 'Anonymous';
    respStmtEl.appendChild(nameEl);

    return respStmtEl;
  }

  annotations.forEach(a => {
    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html
    const annotationEl = document.createElement('annotation');
    annotationEl.setAttribute('xml:id', `uid-${a.id}`);

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
      revisionDescEl.appendChild(createChangeEl('created', a.target.created, a.target.creator.id));

    // Get most recent change
    const lastChanged = getLastChangedAt(a);
    if (lastChanged) {
      const isUpdate = Boolean(lastChanged.updated);

      revisionDescEl.appendChild(createChangeEl(
        'modified', 
        (isUpdate ? lastChanged.updated : lastChanged.created)!, 
        isUpdate ? lastChanged.updatedBy?.id : lastChanged.creator?.id))
    }

    annotationEl.appendChild(revisionDescEl);

    // Add one <note> for each comment
    const comments = a.bodies.filter(b => b.purpose === 'commenting');
    comments.forEach(b => {
      if (b.value) {
        const noteEl = document.createElement('note');
        
        const contributors = 
          Array.from(new Set([b.creator, b.updatedBy].filter(Boolean).map(user => `#uid-${user!.id}`)));
        noteEl.setAttribute('resp', contributors.join(' '));

        const text = b.format === 'Quill' ? serializeQuill(b.value) : b.value;
        noteEl.appendChild(document.createTextNode(text));
        annotationEl.appendChild(noteEl);
      }
    });

    // If there are any tags, create one rs element and add them as the ana attribute
    const tags = a.bodies.filter(b => b.purpose === 'tagging');
    if (tags.length > 0) {
      const rsEl = document.createElement('rs');
      rsEl.setAttribute('ana', tags.map(b => b.value).join(' '))
      annotationEl.appendChild(rsEl);
    }

    // Append respStmt elements for each contributing user
    const contributors = getContributors(a);
    contributors.forEach(user =>
      annotationEl.appendChild(createRespStmtEl(user)));

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