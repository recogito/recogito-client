import type { APIRoute } from 'astro';
import { getAllDocumentLayersInProject, getAllLayersInProject, getProjectPolicies } from '@backend/helpers';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile, getProject } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { annotationsToCSV } from 'src/util/export/csv';

export const GET: APIRoute = async ({ request, params, cookies, url }) => {
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

  const isAdmin = policies.data.get('projects').has('UPDATE') || profile.data.isOrgAdmin;
  if (!isAdmin)
  return new Response(
    JSON.stringify({ error: 'Unauthorized'}),
    { status: 401 });

  const documentId = url.searchParams.get('document');

  // Retrieve all layers, or just for the selected document, based on
  // URL query param
  const layers = documentId ? 
    await getAllDocumentLayersInProject(supabase, documentId, projectId) :
    await getAllLayersInProject(supabase, projectId);
  
  if (layers.error || !layers.data || layers.data.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 }); 

  const layerIds = layers.data.map(l => l.id);

  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 
  }

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const csv = annotationsToCSV(annotations.data, layers.data, includePrivate);

  return new Response(    
    csv,
    { 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': documentId 
          ? `attachment;filename=${layers.data[0].document.name}.csv` 
          : `attachment;filename=project-${project.data.name}.csv`
      },
      status: 200 
    }
  );

};