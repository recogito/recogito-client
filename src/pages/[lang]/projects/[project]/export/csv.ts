import type { APIRoute } from 'astro';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile, getProject } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { annotationsToCSV } from 'src/util/export/csv';
import type { SupabaseClient } from '@supabase/supabase-js';
import { sanitizeFilename } from 'src/util';
import type {Project } from 'src/Types';
import { 
  getAllDocumentLayersInProject, 
  getAllLayersInProject, 
  getProjectPolicies, 
  getAssignment
} from '@backend/helpers';

const exportForProject = async (supabase: SupabaseClient, url: URL, project: Project, documentId: string | null) => {
  // Retrieve all layers, or just for the selected document, based on
  // URL query param
  const layers = documentId ? 
    await getAllDocumentLayersInProject(supabase, documentId, project.id) :
    await getAllLayersInProject(supabase, project.id);
  
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

  const filename = documentId
    ? sanitizeFilename(`${layers.data[0].document.name}.csv`)
    : sanitizeFilename(`project-${project.name}.csv`);

  return new Response(    
    csv,
    { 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment;filename=${filename}`
      },
      status: 200 
    }
  );
}

const exportForAssignment = async (supabase: SupabaseClient, url: URL, contextId: string, documentId: string | null) => {
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
  const layers = documentId 
    ? assignment.data.layers.filter(l => l.document.id === documentId) 
    : assignment.data.layers;

  // Should never happen
  if (layers.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 });

  const annotations = await getAnnotations(supabase, layers.map(l => l.id));
  if (annotations.error)
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const csv = annotationsToCSV(annotations.data, assignment.data.layers, includePrivate);

  return new Response(    
    csv,
    { 
      headers: { 
        'Content-Type': 'text/csv',
        'Content-Disposition': documentId
          ? sanitizeFilename(`attachment;filename=${layers[0].document.name}-assignment-${assignment.data.name}.csv`)
          : sanitizeFilename(`attachment;filename=assignment-${assignment.data.name}.csv`)
      },
      status: 200 
    }
  );
}

export const GET: APIRoute = async ({ params, cookies, url }) => {
  const supabase = await createSupabaseServerClient(cookies);

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

  if (contextId) {
    return exportForAssignment(supabase, url, contextId, documentId);
  } else {
    return exportForProject(supabase, url, project.data, documentId);
  }
}