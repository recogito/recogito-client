import type { APIRoute } from 'astro';
import { AnnotationFactory } from 'annotpdf';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { canExport as _canExport } from './_common';
import { getDocument } from '@backend/crud';
import type { Document } from 'src/Types';
import { getAllDocumentLayersInProject, getAnnotations } from '@backend/helpers';
import { Visibility } from '@recogito/annotorious-supabase';
import type { PDFSelector } from '@recogito/react-pdf-annotator';
import { quillToPDFRichText } from 'src/util';

const exportForProject = async (
  supabase: SupabaseClient, 
  url: URL, 
  projectId: string,
  document: Document,
  pdf: Uint8Array
) => {
  // At the project level, all layers in the project will be exported
  const layers = await getAllDocumentLayersInProject(supabase, document.id, projectId);
  if (layers.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const layerIds = layers.data.map(l => l.id);

  // Download annotations on all layers
  const all = await getAnnotations(supabase, layerIds);
  if (all.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const annotations = includePrivate 
    ? all.data
    : all.data.filter(a => a.visibility !== Visibility.PRIVATE);

  const factory = new AnnotationFactory(pdf)

  annotations.forEach(annotation => {
    (annotation.target.selector as PDFSelector[]).forEach(selector => {
      factory.createHighlightAnnotation({
        page: selector.pageNumber - 1,
        richtextString: annotation.bodies
          .filter(b => b.purpose === 'commenting' && b.value)
          .map(b => quillToPDFRichText(b.value!)).join('\n\n'),
        author: annotation.target.creator?.name,
        creationDate: annotation.target.created,
        color: { r: 255, g: 255, b: 0 },
        quadPoints: selector.quadpoints,
        opacity: 0.5
      });
    });
  });

  const pdfWithAnnotations = factory.write();

  const filename = 'file.pdf';

  return new Response(
    pdfWithAnnotations.buffer,
    { 
      headers: { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

const exportForAssignment = (
  supabase: SupabaseClient, 
  url: URL, 
  contextId: string,
  document: Document,
  pdf: Uint8Array
) => {

  // TODO

  const filename = 'file.pdf';

  return new Response(    
    'hello world',
    { 
      headers: { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

export const GET: APIRoute = async ({ params, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(cookies);

  const projectId = params.project!;

  const canExport = await _canExport(supabase, projectId);
  if (!canExport)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const documentId = url.searchParams.get('document');
  if (!documentId)
    return new Response(
      JSON.stringify({ error: 'Missing query arg: document' }),
      { status: 400 });

  const document = await getDocument(supabase, documentId);
  if (document.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const content = await supabase.storage.from(document.data.bucket_id!).download(documentId);
  if (content.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const pdf = await content.data.arrayBuffer();

  const contextId = url.searchParams.get('context');

  if (contextId) {
    return exportForAssignment(supabase, url, contextId, document.data,  new Uint8Array(pdf));
  } else {
    return exportForProject(supabase, url, projectId, document.data,  new Uint8Array(pdf));
  }

}
