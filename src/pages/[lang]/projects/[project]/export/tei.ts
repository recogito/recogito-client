import type { APIRoute } from 'astro';
import { Visibility } from '@recogito/annotorious-supabase';
import { getAllDocumentLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getDocument, getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { mergeAnnotations, sanitizeFilename } from 'src/util';

export const GET: APIRoute = async ({ params, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(cookies);

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

  // At the project level, only admins can export annotations
  const isAdmin = policies.data.get('projects').has('UPDATE') || profile.data.isOrgAdmin;
  if (!isAdmin)
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

  // At the project level, all layers in the project will be exported
  const layers = await getAllDocumentLayersInProject(supabase, documentId, projectId);
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

  const { name } = document.data;

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

};