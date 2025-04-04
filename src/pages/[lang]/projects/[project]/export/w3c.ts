

import { getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';
import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import type { AnnotationBody, ImageAnnotation, W3CAnnotationBody } from '@annotorious/annotorious';
import { quillToHTML } from '@util/export';

const crosswalkAnnotationBodies = (bodies: AnnotationBody[]) => {
  const crosswalkOne= (body: AnnotationBody) => {
    const { created, creator, purpose } = body;

    const isQuillBody = (!purpose || purpose === 'commenting' || purpose === 'replying') && body.value?.startsWith('{');
  
    const value = isQuillBody ? quillToHTML(body.value!) : body.value;

    const crosswalked: any = {
      created: created?.toISOString() || undefined,
      creator: creator?.name ? { id: creator.id, name: creator.name } : undefined,
      purpose,
      type: body.type || 'TextualBody',
      value
    }

    if (isQuillBody)
      crosswalked.format = 'text/html';

    return crosswalked as W3CAnnotationBody;
  }

  return bodies.map(crosswalkOne);
}

export const GET: APIRoute = async ({ cookies, params, request }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);

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

  const layers = await getAllLayersInProject(supabase, projectId);
  if (layers.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 }); 
  }

  const layerIds = layers.data.map(l => l.id);

  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 
  }

  console.log('yay');

  const imageAnnotations = annotations.data.filter(a => 
    (a.target.selector as any)?.type === 'RECTANGLE' ||
    (a.target.selector as any)?.type === 'POLYGON'
  );

  // 
  const mapped = imageAnnotations.map(annotation => {
    const w3c = serializeW3CImageAnnotation(annotation as ImageAnnotation, projectId);
    return {
      ...w3c,
      body: crosswalkAnnotationBodies(annotation.bodies)
    }
  });

  return new Response(    
    JSON.stringify(mapped, null, 2),
    { status: 200 }
  );

};