import Papa from 'papaparse';
import { getAllDocumentLayersInProject, getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';
import { Visibility, type SupabaseAnnotationBody, type SupabaseAnnotationTarget } from '@recogito/annotorious-supabase';

const getComments = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value);

const getTags = (bodies: SupabaseAnnotationBody[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

export const get: APIRoute = async ({ params, request, cookies, url }) => {
  const supabase = await createSupabaseServerClient(request, cookies);
  if (!supabase)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const profile = await getMyProfile(supabase);
  if (profile.error || !profile.data)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const projectId = params.project!;

  const policies = await getProjectPolicies(supabase, projectId);
  if (policies.error)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const isAdmin = policies.data.get('projects').has('UPDATE') || profile.data.isOrgAdmin;
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

  const getLastUpdated = (target: SupabaseAnnotationTarget, bodies: SupabaseAnnotationBody[]) => {
    const sorted = [target, ...bodies];
    sorted.sort((a, b) => a.updated && b.updated ? a.updated > b.updated ? -1 : 1 : 0);
    return sorted[0].updated;
  }

  const csv = annotations.data.map(a => ({
    id: a.id,
    document: findDocument(a.layer_id!)!,
    created: a.target.created,
    updated: getLastUpdated(a.target, a.bodies),
    comments: getComments(a.bodies).join('|'),
    tags: getTags(a.bodies).join('|'),
    is_private: a.visibility === Visibility.PRIVATE
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