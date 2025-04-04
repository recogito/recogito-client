import type { APIRoute } from 'astro';
import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import type { AnnotationBody, ImageAnnotation, W3CAnnotationBody } from '@annotorious/annotorious';
import { serializeW3CTextAnnotation } from '@recogito/text-annotator';
import { serializeW3CTEIAnnotation } from '@recogito/text-annotator-tei';
import type { TEIAnnotation, TextAnnotation } from '@recogito/react-text-annotator';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { quillToHTML } from '@util/export';

const isNote = (a: SupabaseAnnotation) => !a.target.selector;

const isPlainTextAnnotation = (a: SupabaseAnnotation) => {
  if (!Array.isArray(a.target.selector)) return false;

  return a.target.selector.every(s => 
    typeof s.start === 'number' && typeof s.end === 'number');
}

const isTEIAnnotation = (a: SupabaseAnnotation) => {
  if (!isPlainTextAnnotation(a)) return false;

  return (a.target.selector as any[]).every(s => 
    s.startSelector?.type === 'XPathSelector' && s.endSelector?.type === 'XPathSelector');
}

const isPDFAnnotation = (a: SupabaseAnnotation) => {
  if (!Array.isArray(a.target.selector)) return false;
  return a.target.selector.every(s => 
    typeof s.start === 'number' && typeof s.end === 'number' && typeof s.pageNumber === 'number');
}

const isImageAnnotation = (a: SupabaseAnnotation) =>
  (a.target.selector as any)?.type === 'RECTANGLE' ||
  (a.target.selector as any)?.type === 'POLYGON';

const crosswalkAnnotationBodies = (bodies: AnnotationBody[]) => {
  const crosswalkOne= (body: AnnotationBody) => {
    const { created, creator, purpose } = body;

    const isQuillBody = (!purpose || purpose === 'commenting' || purpose === 'replying') && body.value?.startsWith('{');
  
    const value = isQuillBody ? quillToHTML(body.value!) : body.value;

    const crosswalked: any = {
      created,
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

  const mapped = annotations.data.map(annotation => {
    if (isNote(annotation)) {
      // Notes - just crosswalk the bodies
      return annotation;
    } else if (isImageAnnotation(annotation)) {
      return serializeW3CImageAnnotation(annotation as ImageAnnotation, projectId);
    } else if (isTEIAnnotation(annotation)) {
      return serializeW3CTEIAnnotation(annotation as TEIAnnotation, projectId);
    } else if (isPDFAnnotation(annotation)) {
      // TODO
      return annotation;
    } else if (isPlainTextAnnotation(annotation)) {
      return serializeW3CTextAnnotation(annotation as TextAnnotation, projectId);
    } else {
      // Should never happen
      return annotation;
    }
  }).map(annotation => {
    const { bodies, body, ...rest } = annotation as any;
    return {
      ...rest,
      body: crosswalkAnnotationBodies([...(bodies || []), ...(body || [])])
    }
  });

  return new Response(    
    JSON.stringify(mapped, null, 2),
    { status: 200 }
  );

};