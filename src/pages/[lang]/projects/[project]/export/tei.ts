import type { APIRoute } from 'astro';
import { Visibility } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject, getAssignment, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getDocument, getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { mergeAnnotations, sanitizeFilename } from 'src/util/export';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Document } from 'src/Types';

const exportForProject = async (supabase: SupabaseClient, url: URL, projectId: string, document: Document, xml: string) => {
  // At the project level, all layers in the project will be exported
  const layers = await getAllDocumentLayersInProject(supabase, document.id, projectId);
  if (layers.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const layerIds = layers.data.map(l => l.id);

  // Download annotations on all layers
  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  // Exclude private, if necessary
  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const merged = includePrivate ? 
    mergeAnnotations(xml, annotations.data) : 
    mergeAnnotations(xml, annotations.data.filter(a => a.visibility !== Visibility.PRIVATE));

  const { name } = document;

  const filename = 
    name.endsWith('.tei.xml') ? sanitizeFilename(name.replace('.tei.xml', '')) + '.tei.xml' :
    name.endsWith('.xml') ? sanitizeFilename(name.replace('.xml', '')) + '.xml' :
    sanitizeFilename(name) + '.tei.xml';

  return new Response(    
    merged,
    { 
      headers: { 
        'Content-Type': 'text/xml',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

const exportForAssignment = async (supabase: SupabaseClient, url: URL, contextId: string, document: Document, xml: string) => {
  const assignment = await getAssignment(supabase, contextId);
  if (assignment.error || !assignment.data) {
    const error = await fetch(`${url}/404`);
    return new Response(error.body, { 
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      status: 404, 
      statusText: 'Not Found' 
     }); 
  }
    
  // At the assignment level, only the assignment layer will be exported
  const annotations = await getAnnotations(
    supabase, 
    assignment.data.layers
      .filter(l => l.document.id === document.id)
      // Uncomment to export JUST the active layer, not all layers in this assignment
      // .filter(l => l.is_active_layer)
      .map(l => l.id));

  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  // Exclude private, if necessary
  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const merged = includePrivate ? 
    mergeAnnotations(xml, annotations.data) : 
    mergeAnnotations(xml, annotations.data.filter(a => a.visibility !== Visibility.PRIVATE));

  const filename = document.name.endsWith('.xml')
    ? `${sanitizeFilename(document.name.slice(0, -4))}-${sanitizeFilename(assignment.data.name || '_base')}.xml`
    : `${sanitizeFilename(document.name)}-${sanitizeFilename(assignment.data.name || '_base')}.xml`;

  return new Response(    
    merged,
    { 
      headers: { 
        'Content-Type': 'text/xml',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

export const GET: APIRoute = async ({ cookies, params, request, url }) => {
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

  const hasSelectPermissions = policies.data.get('project_documents').has('SELECT') || profile.data.isOrgAdmin;
  if (!hasSelectPermissions)
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

  const xml = await content.data.text();

  const contextId = url.searchParams.get('context');

  if (contextId) {
    return exportForAssignment(supabase, url, contextId, document.data, xml);
  } else {
    return exportForProject(supabase, url, projectId, document.data, xml);
  }
}