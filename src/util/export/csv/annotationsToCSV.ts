import Papa from 'papaparse';
import { Visibility, type SupabaseAnnotation, type SupabaseAnnotationBody, SupabaseAnnotationTarget } from '@recogito/annotorious-supabase';
import type { LayerWithDocument } from 'src/Types';

/** Helpers **/
const getComments = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value);

const getTags = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

const getLastUpdated = (target: SupabaseAnnotationTarget, bodies: SupabaseAnnotationBody[]) => {
  const sorted = [target, ...bodies];
  sorted.sort((a, b) => a.updated && b.updated ? a.updated > b.updated ? -1 : 1 : 0);
  return sorted[0].updated;
}

/** Crosswalks a list of annotations to CSV using Papaparse **/
export const annotationsToCSV = (annotations: SupabaseAnnotation[], layers: LayerWithDocument[]) => {

  const findDocument = (layerId: string) =>
    layers.find(l => l.id === layerId)?.document?.name;

  const csv = annotations.map(a => ({
    id: a.id,
    document: findDocument(a.layer_id!)!,
    created: a.target.created,
    updated: getLastUpdated(a.target, a.bodies),
    comments: getComments(a.bodies).join('|'),
    tags: getTags(a.bodies).join('|'),
    is_private: a.visibility === Visibility.PRIVATE
  }));

  csv.sort((a, b) => a.document > b.document ? -1 : 1);

  return Papa.unparse(csv);

}