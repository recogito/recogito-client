import Papa from 'papaparse';
import { getAllDocumentLayersInProject, getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';

type BodyLike = { value: string, purpose: string };

const getComments = (bodies: BodyLike[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value);

const getTags = (bodies: BodyLike[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

export const get: APIRoute = async ({ params, request, cookies, url }) => {
  const supabase = await createSupabaseServerClient(request, cookies);
  if (!supabase)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const projectId = params.project!;

  const policies = await getProjectPolicies(supabase, projectId);
  if (policies.error)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const isAdmin = policies.data.get('projects').has('UPDATE');
  if (!isAdmin)
  return new Response(
    JSON.stringify({ error: 'Unauthorized'}),
    { status: 401 });

  const documentId = url.searchParams.get('document');

  // Retrieve all layers, or just for the selected document, based on
  // URL query param
  const layers = documentId ? 
    await getAllDocumentLayersInProject(supabase, documentId, projectId) :
    await getAllLayersInProject(supabase, projectId);

  if (layers.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 }); 

  const layerIds = layers.data.map(l => l.id);

  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 
  }
  
  const findDocument = (layerId: string) =>
    layers.data.find(l => l.id === layerId)?.document?.name;

  const getLastUpdated = (targets: { updated_at: string }[], bodies: { updated_at: string }[]) => {
    const sorted = [...targets, ...bodies];
    sorted.sort((a, b) => a.updated_at > b.updated_at ? -1 : 1 );
    return sorted[0].updated_at;
  }

  const csv = annotations.data.map(a => ({
    id: a.id,
    document: findDocument(a.layer_id)!,
    created: a.created_at,
    updated: getLastUpdated(a.targets, a.bodies),
    comments: getComments(a.bodies).join('|'),
    tags: getTags(a.bodies).join('|'),
    is_private: a.is_private
  }));

  csv.sort((a, b) => a.document > b.document ? -1 : 1);

  return new Response(    
    Papa.unparse(csv),
    { 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment;filename=project-${projectId}.csv`
      },
      status: 200 
    }
  );

};