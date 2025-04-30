import { DOMParser } from 'linkedom';
import { customAlphabet } from 'nanoid';
import slugify from 'slugify';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { AnnotationBody, User } from '@annotorious/react';
import { quillToPlainText } from '../serializeQuillComment';
import type { VocabularyTerm } from 'src/Types';

// Helper
const generateRandomId = (alreadyInUse: Set<string>) => {
  const nanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvw', 14);

  let tries = 0;
  let id: string;

  do {
    id = nanoid();
    tries += 1;
  } while (tries < 100 && alreadyInUse.has(id));

  // Should be a purely hypothetical case...
  if (tries === 100) throw 'Error generating taxonomy ID';

  return id;
};

/** Returns the target or body that was changed most recently **/
const getLastChangedAt = (annotation: SupabaseAnnotation) => {
  const elements = [annotation.target, ...annotation.bodies];
  const timestamped = elements.filter((el) => el.created || el.updated);

  if (timestamped.length > 0) {
    timestamped.sort(
      (a, b) =>
        (a.updated || a.created)!.getTime() -
        (b.updated || b.created)!.getTime()
    );

    return timestamped[0];
  }
};

/** Returns the list of all distinct users that contributed to the annotation **/
const getContributors = (annotation: SupabaseAnnotation) => {
  const elements = [annotation.target, ...annotation.bodies];
  const withContributor = elements.filter((el) => el.creator || el.updatedBy);

  return withContributor.reduce((distinct, el) => {
    const isNewCreator =
      // Creator exists
      el.creator &&
      // Creator is not yet in 'distinct' array
      !distinct.find((user) => user.id === el.creator?.id);

    const isNewContributor =
      // Contributor exists
      el.updatedBy &&
      // Contributors is not yet in 'distinct' array
      !distinct.find((user) => user.id === el.creator?.id) &&
      // Contributor is not the same as Creator
      el.updatedBy.id !== el.creator?.id;

    if (isNewCreator && isNewContributor)
      return [...distinct, el.creator!, el.updatedBy!];
    else if (isNewCreator) return [...distinct, el.creator!];
    else if (isNewContributor) return [...distinct, el.updatedBy!];
    else return distinct;
  }, [] as User[]);
};

const createTaxonomy = (annotations: SupabaseAnnotation[], document: any) => {
  const teiHeader = document.querySelector('teiHeader');
  const existingTaxonomies = teiHeader
    ? teiHeader.querySelectorAll('taxonomy')
    : [];

  const existingTaxonomyIds = new Set(
    [...existingTaxonomies].map((el) => el.getAttribute('xml:id'))
  );

  const taxonomyId = generateRandomId(existingTaxonomyIds);

  const distinctTags: (string | VocabularyTerm)[] = [...new Set(
    annotations.reduce<string[]>((all, annotation) => {
      const tagBodies = (annotation.bodies || []).filter(
        (b) => b.purpose === 'tagging' && b.value
      );
      return [...all, ...tagBodies.map((b) => b.value!)];
    }, [])
  )].map(str => {
    // Tags might be plaintext or semantic
    try {
      return JSON.parse(str) as VocabularyTerm;
    } catch {
      return str;
    }
  });

  // Note: we'll later want to use URIs for tag IDs. Slugifying
  // the label is going to be a fallback option
  const idFromTerm = (term: string | VocabularyTerm, taxonomyId: string) => {
    if (typeof term !== 'string' && term.id) return term.id;

    const label = typeof term === 'string' ? term : term.label;
    const localId = slugify(label, {
      replacement: '_',
      remove: /[*+~.()'"!:@]/g,
      lower: false,
      strict: true,
      locale: 'en',
    });

    return `${taxonomyId}.${localId}`
  }

  const tagsAndIds = [...distinctTags].map(term => ({
    key: typeof term === 'string' ? term : term.id,
    label: typeof term === 'string' ? term : term.label,
    id: idFromTerm(term, taxonomyId)
  }));

  const taxonomyEl = document.createElement('taxonomy');
  taxonomyEl.setAttribute('xml:id', taxonomyId);

  tagsAndIds.forEach(({ label, id }) => {
    const categoryEl = document.createElement('category');
    categoryEl.setAttribute('xml:id', id);

    const catDescEl = document.createElement('catDesc');
    catDescEl.innerHTML = label;
    categoryEl.appendChild(catDescEl);

    taxonomyEl.appendChild(categoryEl);
  });

  // TODO we'll need to change this once tag URIs are supported
  return {
    taxonomyEl,
    taxonomy: Object.fromEntries(
      tagsAndIds.map(({ key, id }) => [key, id])
    ),
  };
};

export const mergeAnnotations = (
  xml: string,
  annotations: SupabaseAnnotation[]
): string => {
  const document = new DOMParser().parseFromString(xml, 'text/xml');

  const teiElement = document.querySelector('TEI');
  if (!teiElement)
    // Should never happen
    throw new Error('No TEI root element found in the XML');

  // https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-standOff.html
  const standOffEl = document.createElement('standOff');
  standOffEl.setAttribute('type', 'recogito_studio_annotations');

  const listAnnotationEl = document.createElement('listAnnotation');
  standOffEl.appendChild(listAnnotationEl);

  const { taxonomyEl, taxonomy } = createTaxonomy(annotations, document);

  // Helpers
  const createChangeEl = (change: string, timestamp: Date, by?: string) => {
    const changeEl = document.createElement('change');
    changeEl.setAttribute('status', change);
    changeEl.setAttribute('when', timestamp.toISOString());

    if (by) changeEl.setAttribute('who', `#uid-${by}`);

    return changeEl;
  };

  const createRespStmtEl = (user: User) => {
    const respStmtEl = document.createElement('respStmt');
    respStmtEl.setAttribute('xml:id', `uid-${user.id}`);

    const nameEl = document.createElement('name');
    nameEl.innerHTML = user.name || 'Anonymous';
    respStmtEl.appendChild(nameEl);

    return respStmtEl;
  };

  annotations.forEach((a) => {
    // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html
    const annotationEl = document.createElement('annotation');
    annotationEl.setAttribute('xml:id', `uid-${a.id}`);

    // "Notes" (= annotations without a selector) are simply serialized as TEI annotations
    // without a 'target' attribute
    if (a.target.selector) {
      // See https://tei-c.org/release/doc/tei-p5-doc/en/html/ref-annotation.html#tei_att.target
      const selector =
        a.target.selector && Array.isArray(a.target.selector)
          ? a.target.selector[0]
          : a.target.selector;

      const { startSelector, endSelector } = selector;
      annotationEl.setAttribute(
        'target',
        `${startSelector.value} ${endSelector.value}`
      );
    }

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
    if (a.target.created && a.target.creator)
      revisionDescEl.appendChild(
        createChangeEl('created', a.target.created, a.target.creator.id)
      );

    // Get most recent change
    const lastChanged = getLastChangedAt(a);
    if (lastChanged) {
      const isUpdate = Boolean(lastChanged.updated);

      revisionDescEl.appendChild(
        createChangeEl(
          'modified',
          (isUpdate ? lastChanged.updated : lastChanged.created)!,
          isUpdate ? lastChanged.updatedBy?.id : lastChanged.creator?.id
        )
      );
    }

    annotationEl.appendChild(revisionDescEl);

    // Add one <note> for each comment
    const comments = a.bodies.filter((b) => b.purpose === 'commenting');
    comments.forEach((b) => {
      if (b.value) {
        const noteEl = document.createElement('note');

        const contributors = Array.from(
          new Set(
            [b.creator, b.updatedBy]
              .filter(Boolean)
              .map((user) => `#uid-${user!.id}`)
          )
        );
        noteEl.setAttribute('resp', contributors.join(' '));

        const text = b.format === 'Quill' ? quillToPlainText(b.value) : b.value;
        noteEl.appendChild(document.createTextNode(text));
        annotationEl.appendChild(noteEl);
      }
    });

    // If there are any tags, create one rs element and add them as the ana attribute
    const tags = a.bodies.filter((b) => b.purpose === 'tagging' && b.value);
    if (tags.length > 0) {
      const rsEl = document.createElement('rs');

      const getKey = (b: AnnotationBody) => { 
        try {
          const tag: VocabularyTerm = JSON.parse(b.value!);
          const key = tag.id || tag.label;
          return key.match(/^https?:/) ? key : `#${key}`;
        } catch {
          return b.value;
        }
      }

      rsEl.setAttribute(
        'ana',
        tags.map((b) => getKey(b)).join(' ')
      );
      annotationEl.appendChild(rsEl);
    }

    // Append respStmt elements for each contributing user
    const contributors = getContributors(a);
    contributors.forEach((user) =>
      annotationEl.appendChild(createRespStmtEl(user))
    );

    listAnnotationEl.appendChild(annotationEl);
  });

  // Existing teiHeader and/or standOff elements
  let teiHeader = teiElement.querySelector('teiHeader');

  if (Object.keys(taxonomy).length > 0) {
    const getOrCreateChild = (parent: any, childName: string) => {
      const existing = parent.querySelector(childName);
      if (!existing) {
        const child = document.createElement(childName);
        parent.appendChild(child);
        return child;
      } else {
        return existing;
      }
    };

    // Append taxonomy to teiHeader > encodingDesc > classDecl - create if necessary
    if (!teiHeader) {
      teiHeader = document.createElement('teiHeader');
      document.querySelector('TEI').prepend(teiHeader);
    }

    const encodingDesc = getOrCreateChild(teiHeader, 'encodingDesc');
    const classDecl = getOrCreateChild(encodingDesc, 'classDecl');

    classDecl.appendChild(taxonomyEl);
    encodingDesc.appendChild(classDecl);
    teiHeader.appendChild(encodingDesc);
  }

  const existingStandOffEls = teiElement.querySelectorAll('standOff');

  if (existingStandOffEls?.length > 0) {
    // Insert after the last existing standOff element
    const lastStandOff = existingStandOffEls[existingStandOffEls.length - 1];
    const nextSibling = lastStandOff.nextSibling;

    if (nextSibling) teiElement.insertBefore(standOffEl, nextSibling);
    else teiElement.appendChild(standOffEl);
  } else if (teiHeader) {
    // No existing standOffs, but header - insert after header
    const nextSibling = teiHeader.nextSibling;

    if (nextSibling) {
      teiElement.insertBefore(standOffEl, nextSibling);
    } else {
      teiElement.appendChild(standOffEl);
    }
  } else {
    teiElement.prepend(standOffEl);
  }

  return document.toString();
};
