import Papa from 'papaparse';
import type { DeltaStatic, DeltaOperation } from 'quill';
import { Visibility } from '@recogito/annotorious-supabase';
import type { SupabaseAnnotation, SupabaseAnnotationBody, SupabaseAnnotationTarget } from '@recogito/annotorious-supabase';
import type { Document } from 'src/Types';

/** Helpers **/
const getComments = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value 
    ? b.format === 'Quill' ? serializeQuillJSON(JSON.parse(b.value)) : b.value 
    : undefined).filter(Boolean);

const serializeQuillJSON = (input: DeltaStatic) => {
  let serialized = '';

  input.ops?.forEach((op: DeltaOperation) => {
    if (typeof op.insert === "string") {
      serialized += op.insert;
    }
  })

  return serialized;
}

const getTags = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

const getLastUpdated = (target: SupabaseAnnotationTarget, bodies: SupabaseAnnotationBody[]) => {
  const sorted = [target, ...bodies];
  sorted.sort((a, b) => a.updated && b.updated ? a.updated > b.updated ? -1 : 1 : 0);
  return sorted[0].updated;
}

/** Crosswalks a list of annotations to CSV using Papaparse **/
export const annotationsToCSV = (annotations: SupabaseAnnotation[], layers: { id: string, document: Document }[]) => {

  const findDocument = (layerId: string) =>
    layers.find(l => l.id === layerId)?.document;

  const csv = annotations.map(a => {
    const doc = findDocument(a.layer_id!)!;
    return {
      id: a.id,
      document: doc.name,
      quote: 'quote' in a.target.selector ? a.target.selector.quote : '', 
      created: a.target.created,
      updated: getLastUpdated(a.target, a.bodies),
      comments: getComments(a.bodies).join('|'),
      tags: getTags(a.bodies).join('|'),
      is_private: a.visibility === Visibility.PRIVATE
    }
  });

  csv.sort((a, b) => a.document > b.document ? -1 : 1);

  return Papa.unparse(csv);

}