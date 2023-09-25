import { getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';

type BodyLike = { value: string, purpose: string };

const getComments = (bodies: BodyLike[]) =>
  bodies.filter(b => b.purpose === 'commenting').map(b => b.value);

const getTags = (bodies: BodyLike[]) =>
  bodies.filter(b => b.purpose === 'tagging').map(b => b.value);

export const get: APIRoute = async ({ params, request, cookies }) => {
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

  const layers = await getAllLayersInProject(supabase, projectId);
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
    layers.data.find(l => l.id === layerId)?.document.name;

  const csv = annotations.data.map(a => ([
    a.id,
    findDocument(a.layer_id),
    getComments(a.bodies).join('|'),
    getTags(a.bodies).join('|'),
    a.targets.toString()
  ])).join('\r\n');

  return new Response(    
    csv,
    { status: 200 }
  );

};