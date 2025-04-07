import type { APIRoute } from 'astro';
import { getAllDocumentLayersInContext, getAllDocumentLayersInProject, getAllLayersInProject, getAnnotations, getAssignment, getAvailableLayers, getProjectPolicies } from '@backend/helpers';
import { getMyProfile, getProject } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from 'src/Types';
import { annotationsToW3C } from '@util/export/w3c/w3cExporter';
import { Visibility } from '@recogito/annotorious-supabase';
import { sanitizeFilename } from '@util/export';

const exportManifest = async (
  supabase: SupabaseClient, 
  url: URL, 
  documentId: string,
  project: Project,
  contextId: string | null
) => {
  // Retrieve all layers, or just for the selected document
  const layers = contextId 
    ? await getAllDocumentLayersInContext(supabase, documentId, contextId) 
    : await getAllDocumentLayersInProject(supabase, documentId, project.id);

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

  const w3c = annotationsToW3C(
    filtered, 
    project.id
  );

  // TODO manifest!

  return new Response(    
    JSON.stringify(w3c, null, 2),
    {
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
    return exportManifest(supabase, url, documentId, project.data, contextId);
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