
import type { APIRoute } from 'astro';
import { Visibility } from '@recogito/annotorious-supabase';
import { getAssignment, getProjectExtended } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getDocument, getMyProfile } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { mergeAnnotations } from 'src/util';

export const get: APIRoute = async ({ params, request, cookies, url }) => {
  // Verify if the user is logged in
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

  const project = await getProjectExtended(supabase, projectId as string);
  if (project.error || !project.data) { 
    const error = await fetch(`${url}/404`);
    return new Response(error.body, { 
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      status: 404, 
      statusText: 'Not Found' 
     }); 
  }
  
  const assignmentId = params.assignment!;
  
  const assignment = await getAssignment(supabase, assignmentId);
  if (assignment.error || !assignment.data) {
    const error = await fetch(`${url}/404`);
    return new Response(error.body, { 
      headers: { 'Content-Type': 'text/html;charset=utf-8' },
      status: 404, 
      statusText: 'Not Found' 
     }); 
  }

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

  // Download TEI from DB
  const content = await supabase.storage.from(document.data.bucket_id!).download(documentId);
  if (content.error)
    return new Response(
      JSON.stringify({ message: 'Internal server error' }), 
      { status: 500 }); 

  const xml = await content.data.text();

  // At the assignment level, only the assignment layer will be exported
  const annotations = await getAnnotations(supabase, assignment.data.layers.map(l => l.id));
  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  // Exclude private, if necessary
  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const merged = includePrivate ? 
    mergeAnnotations(xml, annotations.data) : 
    mergeAnnotations(xml, annotations.data.filter(a => a.visibility !== Visibility.PRIVATE));

  const filename = document.data.name.endsWith('.xml') ?
    document.data.name : `${document.data.name}-${assignment.data.name}.tei.xml`

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