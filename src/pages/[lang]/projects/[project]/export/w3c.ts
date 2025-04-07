import type { APIRoute } from 'astro';
import { serializeW3CImageAnnotation } from '@annotorious/annotorious';
import type { AnnotationBody, ImageAnnotation, W3CAnnotationBody } from '@annotorious/annotorious';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { type TextAnnotation, serializeW3CTextAnnotation } from '@recogito/text-annotator';
import { type TEIAnnotation, serializeW3CTEIAnnotation } from '@recogito/text-annotator-tei';
import type { PDFAnnotation } from '@recogito/pdf-annotator';
import { serializeW3CPDFAnnotation } from '@recogito/pdf-annotator/w3c';
import { getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { quillToHTML } from '@util/export';

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
    if (isImageAnnotation(annotation)) {
      return serializeW3CImageAnnotation(annotation as ImageAnnotation, projectId);
    } else if (isPDFAnnotation(annotation)) {
      return serializeW3CPDFAnnotation(annotation as PDFAnnotation, projectId);
    } else if (isTEIAnnotation(annotation)) {
      return serializeW3CTEIAnnotation(annotation as TEIAnnotation, projectId);
    } else if (isPlainTextAnnotation(annotation)) {
      return serializeW3CTextAnnotation(annotation as TextAnnotation, projectId);
    } else {
      // Should only ever happen for Notes - bodies will be
      // crosswalked in the next mapping step
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