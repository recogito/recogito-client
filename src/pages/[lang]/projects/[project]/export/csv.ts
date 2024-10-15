import type { APIRoute } from 'astro';
import { getAnnotations } from '@backend/helpers/annotationHelpers';
import { getMyProfile, getProject } from '@backend/crud';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { annotationsToCSV } from 'src/util/export/csv';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getTranslations } from '@i18n';
import { sanitizeFilename } from 'src/util';
import type {Project, Translations } from 'src/Types';
import { 
  getAllDocumentLayersInProject, 
  getAllLayersInProject, 
  getProjectPolicies, 
  getAssignment,
  getAvailableLayers
} from '@backend/helpers';

const exportForProject = async (
  supabase: SupabaseClient, 
  url: URL, 
  project: Project, 
  documentId: string | null,
  i18n: Translations
) => {
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

  // Get annotations for all layers
  const annotations = await getAnnotations(supabase, layerIds);
  if (annotations.error) { 
    return new Response(
      JSON.stringify({ message: 'Error retrieving annotations' }), 
      { status: 500 }); 
  }

  // Retrieve meta for all layers in project, so we have the name
  // of the context each layer belongs to
  const layerMeta = await getAvailableLayers(supabase, project.id);

  if (layerMeta.error || !layerMeta.data || layerMeta.data.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const csv = annotationsToCSV(
    annotations.data, 
    layers.data, 
    layerMeta.data, 
    includePrivate,
    i18n,
  );

  const filename = documentId
    ? `${sanitizeFilename(layers.data[0].document.name)}.csv`
    : `project-${sanitizeFilename(project.name)}.csv`;

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

const exportForContext = async (
  supabase: SupabaseClient, 
  url: URL, 
  project: Project,
  contextId: string, 
  documentId: string | null,
  i18n: Translations
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

  // Retrieve meta for all layers in project, so we have the name
  // of the context each layer belongs to
  const layerMeta = await getAvailableLayers(supabase, assignment.data.project_id);
  if (layerMeta.error || !layerMeta.data || layerMeta.data.length === 0)
    return new Response(
      JSON.stringify({ message: 'Error retrieving layers' }), 
      { status: 500 }); 

  const includePrivate = url.searchParams.get('private')?.toLowerCase() === 'true';

  const csv = annotationsToCSV(
    annotations.data, 
    assignment.data.layers, 
    layerMeta.data, 
    includePrivate,
    i18n);

  const assignmentName = assignment.data.name || project.name;

  const filename = documentId
    ? `${sanitizeFilename(layers[0].document.name)}-assignment-${sanitizeFilename(assignmentName)}.csv`
    : `${sanitizeFilename(assignmentName)}.csv`;

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

export const GET: APIRoute = async ({ cookies, params, request, url }) => {
  const i18n = getTranslations(request, 'annotation-common');

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
    return exportForContext(supabase, url, project.data, contextId, documentId, i18n);
  } else {
    return exportForProject(supabase, url, project.data, documentId, i18n);
  }
}