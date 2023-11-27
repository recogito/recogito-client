import Papa from 'papaparse';
import { Visibility } from '@recogito/annotorious-supabase';
import type { SupabaseAnnotation, SupabaseAnnotationBody, SupabaseAnnotationTarget } from '@recogito/annotorious-supabase';
import type { Document } from 'src/Types';
import { serializeQuill } from '../serializeQuillComment';

/** Helpers **/
const getComments = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value 
    ? b.format === 'Quill' ? serializeQuill(b.value) : b.value 
    : undefined).filter(Boolean);

const getTags = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

const getContributors = (bodies: SupabaseAnnotationBody[]): string[] => 
  bodies.filter(b => b.creator?.name).map(b => b.creator!.name!);

const getLastUpdated = (target: SupabaseAnnotationTarget, bodies: SupabaseAnnotationBody[]) => {
  const sorted = [target, ...bodies];
  sorted.sort((a, b) => a.updated && b.updated ? a.updated > b.updated ? -1 : 1 : 0);
  return sorted[0].updated;
}

/** Crosswalks a list of annotations to CSV using Papaparse **/
export const annotationsToCSV = (annotations: SupabaseAnnotation[], layers: { id: string, document: Document }[]) => {

  const findDocument = (layerId: string) =>
    layers.find(l => l.id === layerId)?.document;

  console.log(JSON.stringify(annotations, null, 2));

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
      contributors: getContributors(a.bodies).join('|'),
      is_private: a.visibility === Visibility.PRIVATE
    }
  });

  csv.sort((a, b) => a.document > b.document ? -1 : 1);

  return Papa.unparse(csv);

}