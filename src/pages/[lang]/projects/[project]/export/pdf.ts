import type { APIRoute } from 'astro';
import { AnnotationFactory } from 'annotpdf';
import { format } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { canExport as _canExport } from './_common';
import { getDocument } from '@backend/crud';
import type { Document } from 'src/Types';
import { getAllDocumentLayersInProject, getAnnotations, getAssignment } from '@backend/helpers';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { PDFSelector } from '@recogito/react-pdf-annotator';
import { quillToPDFRichText, sanitizeFilename } from 'src/util';

const writePDFAnnotations = (pdf: Uint8Array, annotations: SupabaseAnnotation[]) => {
  const factory = new AnnotationFactory(pdf);

  const toRichText = (annotation: SupabaseAnnotation) => {
    const comments = 
      annotation.bodies.filter(b => b.purpose === 'commenting' && b.value);

    const tags =
      annotation.bodies.filter(b => b.purpose === 'tagging' && b.value);

    // Should never happen
    if (comments.length + tags.length === 0) return '';

    const [comment, ...replies] = comments;

    // Initial comment doesn't need author/timestamp, since that's
    // already in the PDF annotation metadata.
    let richText = quillToPDFRichText(comment.value!) + '\n\n';

    for (const reply of replies) {
      if (reply.creator?.name && reply.created)
        richText += `<p>- ${reply.creator.name} (${format(reply.created, 'HH:mm, MMM dd yyyy')})</p>\n\n`;
      else if (reply.creator?.name)
        richText += `<p>- ${reply.creator.name}</p>\n\n`;
      else if (reply.created)
        richText += `<p>- Anonymous (${format(reply.created, 'HH:mm, MMM dd yyyy')})</p>\n\n`;
      else
        richText += '<p>-</p>\n\n';

      richText += quillToPDFRichText(reply.value!);
    }

    if (tags.length > 0)
      richText += `<p>${tags.map(b => `<span color="gray">[<i>${b.value}</i>]</span>`).join(' ')}</p>\n\n`;

    return `<html><body>${richText}</body></html>`;
  }

  annotations.forEach(annotation => {
    (annotation.target.selector as PDFSelector[]).forEach(selector => {
      factory.createHighlightAnnotation({
        page: selector.pageNumber - 1,
        richtextString: toRichText(annotation),
        author: annotation.target.creator?.name,
        creationDate: annotation.target.created,
        color: { r: 255, g: 255, b: 0 },
        quadPoints: selector.quadpoints,
        opacity: 0.5
      });
    });
  });

  return factory.write();
}

const sanitizeName = (name: string) =>
  name.split('.').map(str => sanitizeFilename(str)).join('.');

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

  const pdfWithAnnotations = writePDFAnnotations(pdf, annotations);

  const filename = sanitizeName(document.name);

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

const exportForAssignment = async (
  supabase: SupabaseClient, 
  url: URL, 
  contextId: string,
  document: Document,
  pdf: Uint8Array
) => {
  const assignment = await getAssignment(supabase, contextId);
  if (assignment.error || !assignment.data) {
    const error = await fetch(`${url}/404`);
    return new Response(error.body, { 
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      status: 404, 
      statusText: 'Not Found' 
    });
  }

  // Retrieve all layers, or just for the selected document
  const layers = document.id 
    ? assignment.data.layers.filter(l => l.document.id === document.id) 
    : assignment.data.layers;

  // Should never happen
  if (layers.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 });

  const all = await getAnnotations(supabase, layers.map(l => l.id));
  if (all.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const annotations = includePrivate 
    ? all.data
    : all.data.filter(a => a.visibility !== Visibility.PRIVATE);

  const pdfWithAnnotations = writePDFAnnotations(pdf, annotations);

  const filename = sanitizeName(document.name);

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
