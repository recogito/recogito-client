import type { APIRoute } from 'astro';
import { Cozy } from 'cozy-iiif';
import { getDocument, getMyProfile, getProject } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Document, Project } from 'src/Types';
import { annotationsToW3C } from '@util/export/w3c/w3cExporter';
import { Visibility } from '@recogito/annotorious-supabase';
import { 
  getAllDocumentLayersInContext, 
  getAllDocumentLayersInProject, 
  getAnnotations, 
  getProjectPolicies 
} from '@backend/helpers';

const exportManifest = async (
  supabase: SupabaseClient, 
  url: URL, 
  document: Document,
  project: Project,
  contextId: string | null
) => {
  // Retrieve all layers, or just for the selected document
  const layers = contextId 
    ? await getAllDocumentLayersInContext(supabase, document.id, contextId) 
    : await getAllDocumentLayersInProject(supabase, document.id, project.id);

  if (layers.error || !layers.data)
    return new Response(
      JSON.stringify({ message: 'Not Found' }), 
      { status: 404 });

  // Should never happen
  if (layers.data.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 });

  const annotations = await getAnnotations(supabase, layers.data.map(l => l.id));
  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';
  
  const filtered = includePrivate 
      ? annotations.data
      : annotations.data.filter(a => a.visibility !== Visibility.PRIVATE);

  const w3cAnnotations = annotationsToW3C(
    filtered, 
    project.id
  );
  
  const json = await fetch(document.meta_data!.url).then(res => res.json());
  const parsed = Cozy.parse(json);

  if (parsed.type !== 'manifest')
    return new Response(
      JSON.stringify({ message: 'Error retrieving manifest' }), 
      { status: 424 }); // HTTP Failed Dependency
  
  const manifest = parsed.resource;

  return new Response(    
    JSON.stringify(manifest.source, null, 2),
    // JSON.stringify(w3cAnnotations, null, 2),
    {
      headers: { 
        'Content-Type': 'application/json'
      },
      status: 200 
    }
  );
}

export const GET: APIRoute = async ({ cookies, params, request, url }) => {
  const supabase = await createSupabaseServerClient(request, cookies);

  const profile = await getMyProfile(supabase);
  if (profile.error || !profile.data)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

  const projectId = params.project!;

  const project = await getProject(supabase, projectId);
  if (project.error || !project.data)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

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
  const contextId = url.searchParams.get('context');

  if (documentId) {
    const document = await getDocument(supabase, documentId);
    if (document.error || !document.data.meta_data?.url)
      return new Response(
        JSON.stringify({ error: 'Not Found'}),
        { status: 404 });

    return exportManifest(supabase, url, document.data, project.data, contextId);
  } else {
    // TODO in theory, we could export a Collection manifest here, which links to the 
    // individual document Presentation manifests. But not sure if it really makes sense,
    // Given that manifests are only useful for download, not serving (because of permissions!)
    return new Response(    
      JSON.stringify({ message: 'Method not allowed' }),
      {
        status: 405
      }
    );
  }
}