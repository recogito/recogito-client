import type { APIRoute } from 'astro';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { canExport as _canExport } from './_common';
import { getDocument } from '@backend/crud';
import type { Document } from 'src/Types';

const exportForProject = (
  supabase: SupabaseClient, 
  url: URL, 
  projectId: string,
  document: Document,
  pdf: string
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

const exportForAssignment = (
  supabase: SupabaseClient, 
  url: URL, 
  contextId: string,
  document: Document,
  pdf: string
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

  const pdf = await content.data.text();

  const contextId = url.searchParams.get('context');

  if (contextId) {
    return exportForAssignment(supabase, url, contextId, document.data, pdf);
  } else {
    return exportForProject(supabase, url, projectId, document.data, pdf);
  }

}
