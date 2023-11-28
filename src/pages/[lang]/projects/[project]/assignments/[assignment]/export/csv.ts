import type { APIRoute } from 'astro';
import { Visibility } from '@recogito/annotorious-supabase';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { getMyProfile } from '@backend/crud';
import { getAnnotations, getAssignment, getProjectPolicies } from '@backend/helpers';
import { annotationsToCSV } from 'src/util/export/csv';

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

  const policies = await getProjectPolicies(supabase, projectId);
  if (policies.error)
    return new Response(
      JSON.stringify({ error: 'Unauthorized'}),
      { status: 401 });

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

  // Retrieve all layers, or just for the selected document, based on
  // URL query param
  const layers = documentId 
    ? assignment.data.layers.filter(l => l.document.id === documentId) 
    : assignment.data.layers;

  // At the assignment level, only the assignment layer will be exported
  const annotations = await getAnnotations(supabase, layers.map(l => l.id));
  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const csv = includePrivate 
    ? annotationsToCSV(annotations.data, assignment.data.layers)
    : annotationsToCSV(annotations.data.filter(a => a.visibility !== Visibility.PRIVATE), assignment.data.layers);

  return new Response(    
    csv,
    { 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment;filename=project-${projectId}.csv`
      },
      status: 200 
    }
  );

}