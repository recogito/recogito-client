import type { APIRoute } from 'astro';
import { PDFDocument } from 'pdf-lib';
import { AnnotationFactory } from 'annotpdf';
import { format } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { AnnotationBody } from '@annotorious/annotorious';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { PDFSelector } from '@recogito/react-pdf-annotator';
import { getDocument } from '@backend/crud';
import { getAllDocumentLayersInProject, getAnnotations, getAssignment } from '@backend/helpers';
import { quillToPDFRichText, sanitizeFilename } from '@util/export';
import { canExport as _canExport } from './_common';
import type { Document, VocabularyTerm } from 'src/Types';

/**
 * Important: annotpdf only supports FlateDecode streams:
 * https://github.com/highkite/pdfAnnotate/blob/b5e5bc2a4947d604610d15d78f47289074a0f2b7/src/object-util.ts#L229
 *
 * But PDFs can include images encoded with other filters. In this case, we use 
 * pdf-lib to normalize all streams to FlateDecode.
 */
const normalizePDF = async (pdf: Uint8Array) => {
  // To avoid re-encoding the PDF unnecessarily, decode the text content, 
  // search for filters, and re-encode only if any filters other than 
  // FlateDecode are found.
  const pdfString = new TextDecoder('latin1').decode(pdf);
  const filters = new Set([...pdfString.matchAll(/\/Filter\s*\/(\w+)/g)].map(match => match[1]));
  const unsupportedFilters = [...filters].filter(f => f !== 'FlateDecode');

  if (unsupportedFilters.length > 0) {
    return PDFDocument.load(pdf).then(doc => doc.save())
  } else {
    return Promise.resolve(pdf);
  }
}

const writePDFAnnotations = async (pdf: Uint8Array, annotations: SupabaseAnnotation[]) => {
  const normalizedPdf = await normalizePDF(pdf);
  const factory = new AnnotationFactory(normalizedPdf);

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
    let richText = comment ? quillToPDFRichText(comment.value!) + '\n\n' : '';

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

    const serializeTag = (b: AnnotationBody) => {
      try {
        const term: VocabularyTerm = JSON.parse(b.value!);
        return term.id ? `${term.label} (${term.id})` : term.label;
      } catch {
        return b.value;
      }
    }

    if (tags.length > 0)
      richText += `<p>${tags.map(b => `<span color="gray">[<i>${serializeTag(b)}</i>]</span>`).join(' ')}</p>\n\n`;

    return `<html><body>${richText}</body></html>`;
  }

  annotations
    .filter(annotation => 
      (annotation.target.selector as PDFSelector[]).every(s => (s.quadpoints || []).length > 0))
    .forEach(annotation => {
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


  const pdfWithAnnotations = await writePDFAnnotations(pdf, annotations);

  const filename = sanitizeName(document.name);

  return new Response(
    new Uint8Array(pdfWithAnnotations.buffer) as BodyInit,
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

  const pdfWithAnnotations = await writePDFAnnotations(pdf, annotations);

  const filename = sanitizeName(document.name);

  return new Response(
    new Uint8Array(pdfWithAnnotations.buffer) as BodyInit,
    { 
      headers: { 
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

export const GET: APIRoute = async ({ request, params, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);

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
