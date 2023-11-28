import Papa from 'papaparse';
import { Visibility } from '@recogito/annotorious-supabase';
import type { SupabaseAnnotation, SupabaseAnnotationBody, SupabaseAnnotationTarget } from '@recogito/annotorious-supabase';
import type { Document } from 'src/Types';
import { serializeQuill } from '../serializeQuillComment';

/** Helpers **/
const serializeBodyValue = (b: SupabaseAnnotationBody) =>
  b.value 
    ? b.format === 'Quill' ? serializeQuill(b.value) : b.value 
    : undefined;

const serializeTarget = (t: SupabaseAnnotationTarget) => {
  // Shorthand
  const round = (num: number) => Math.round(num * 100) / 100;

  const { selector } = t;

  // Notes don't have selectors!
  if (!selector)
    return;

  if ('start' in selector && 'end' in selector) {
    if ('pageNumber' in selector)
      // PDF annotation
      return `page=${selector.pageNumber};start=${selector.start};end=${selector.end}`;
    else 
      // TEI or plaintext annotation
      return `start=${selector.start};end=${selector.end}`;
  } else if ('geometry' in selector && 'type' in selector) {
    // Image annotation
    const { type } = selector;
    if (type === 'RECTANGLE') {
      const { x, y, w, h } = selector.geometry as any;
      return `xywh=${round(x)},${round(y)},${round(w)},${round(h)}`;
    } else if (type === 'POLYGON') {
      const points = (selector.geometry as any).points as number[][];
      return `points=${points.map(xy => xy.map(n => round(n)).join(',')).join(' ')}`;
    } else {
      // Fallback
      return JSON.stringify(selector);
    }
  }
}

const sortRows = (a: any, b: any): number => {
  // 1. sort by document
  // 2. sort by target
  // 3. sort by created 
 // Compare by "document"
 const byDocument = a.document.localeCompare(b.document);
 if (byDocument !== 0)
   return byDocument;

 const byTarget = a.target.localeCompare(b.target);
 if (byTarget !== 0)
   return byTarget;

 const createdDate1 = new Date(a.created).getTime();
 const createdDate2 = new Date(b.created).getTime();
 return createdDate1 - createdDate2;
}

/** Crosswalks a list of annotations to CSV using Papaparse **/
export const annotationsToCSV = (annotations: SupabaseAnnotation[], layers: { id: string, document: Document }[]) => {

  const findDocument = (layerId: string) =>
    layers.find(l => l.id === layerId)?.document;

  const csv = annotations.reduce((csv, a) => {
    const doc = findDocument(a.layer_id!)!;

    return [...csv, ...a.bodies.map(body => ({
      annotation_id: a.id,
      document: doc.name,
      text_quote: a.target.selector ? 'quote' in a.target.selector ? a.target.selector.quote : '' : '', 
      target: serializeTarget(a.target),
      body_purpose: body.purpose,
      body_value: serializeBodyValue(body),
      created: body.created,
      updated: body.updated,
      created_by: body.creator?.name,
      updated_by: body.updatedBy?.name,
      is_private: a.visibility === Visibility.PRIVATE
    }))]
  }, [] as any[]);

  csv.sort(sortRows);

  return Papa.unparse(csv);

}