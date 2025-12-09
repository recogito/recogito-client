import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { exportAnnotations, exportBodies, exportTargets } from '@trigger/exportProject/annotations';
import { exportContextDocuments, exportContexts, exportContextUsers } from '@trigger/exportProject/context';
import { exportDocuments, exportFiles, exportIIIF, exportProjectDocuments } from '@trigger/exportProject/documents';
import { exportGroupUsers, exportProjectGroups } from '@trigger/exportProject/groups';
import { exportLayerContexts, exportLayerGroups, exportLayers } from '@trigger/exportProject/layers';
import { exportProjects } from '@trigger/exportProject/projects';
import { exportTagDefinitions, exportTags } from '@trigger/exportProject/tags';
import { logger, task } from '@trigger.dev/sdk/v3';
import { exportProfiles } from '@trigger/exportProject/users';
import AdmZip from 'adm-zip';

const SUPABASE_SERVER_URL = process.env.SUPABASE_SERVERCLIENT_URL || process.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY = process.env.PUBLIC_SUPABASE_API_KEY;

interface Payload {
  jobId: string;
  projectId?: string;
  token: string;
}

const addToZip = (
  zip: AdmZip,
  filename: string,
  data: any | null = ''
) => {
  const content = JSON.stringify(data || '{}');
  zip.addFile(filename, Buffer.alloc(content.length || 0,  content));
};

const addDocumentsToZip = (
  zip: AdmZip,
  files: { [key: string]: ArrayBuffer }
) => {
  Object.entries(files).forEach(([key, data]) => {
    zip.addFile(`/documents/${key}`, Buffer.from(data));
  });
}

export const exportProject = task({
  id: 'export-project',
  run: async (payload: Payload) => {
    const { jobId, projectId, token } = payload;

    if (!(SUPABASE_SERVER_URL && SUPABASE_API_KEY)) {
      logger.error('Invalid Supabase credentials');
      return;
    }

    if (!projectId) {
      logger.error('Project ID is required');
      return;
    }

    logger.info('Creating Supabase client');

    const supabase = createClient(SUPABASE_SERVER_URL, SUPABASE_API_KEY, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    });

    const zip = new AdmZip();

    // Export table data to CSV

    logger.info('Exporting data as JSON');

    const { data: annotations } = await exportAnnotations(supabase, projectId);
    addToZip(zip, 'annotations.json', annotations);

    const { data: bodies } = await exportBodies(supabase, projectId);
    addToZip(zip, 'bodies.json', bodies);

    const { data: contextDocuments } = await exportContextDocuments(supabase, projectId);
    addToZip(zip, 'context_documents.json', contextDocuments);

    const { data: contextUsers } = await exportContextUsers(supabase, projectId);
    addToZip(zip, 'context_users.json', contextUsers);

    const { data: contexts } = await exportContexts(supabase, projectId);
    addToZip(zip, 'contexts.json', contexts);

    const { data: documents } = await exportDocuments(supabase, projectId);
    addToZip(zip, 'documents.json', documents);

    const { data: groupUsers } = await exportGroupUsers(supabase, projectId);
    addToZip(zip, 'group_users.json', groupUsers);

    const { data: layerContexts } = await exportLayerContexts(supabase, projectId);
    addToZip(zip, 'layer_contexts.json', layerContexts);

    const { data: layerGroups } = await exportLayerGroups(supabase, projectId);
    addToZip(zip, 'layer_groups.json', layerGroups);

    const { data: layers } = await exportLayers(supabase, projectId);
    addToZip(zip, 'layers.json', layers);

    const { data: profiles } = await exportProfiles(supabase, projectId);
    addToZip(zip, 'profiles.json', profiles);

    const { data: projectDocuments } = await exportProjectDocuments(supabase, projectId);
    addToZip(zip, 'project_documents.json', projectDocuments);

    const { data: projectGroups } = await exportProjectGroups(supabase, projectId);
    addToZip(zip, 'project_groups.json', projectGroups);

    const { data: projects } = await exportProjects(supabase, projectId);
    addToZip(zip, 'projects.json', projects);

    const { data: tagDefinitions } = await exportTagDefinitions(supabase, projectId);
    addToZip(zip, 'tag_definitions.json', tagDefinitions);

    const { data: tags } = await exportTags(supabase, projectId);
    addToZip(zip, 'tags.json', tags);

    const { data: targets } = await exportTargets(supabase, projectId);
    addToZip(zip, 'targets.json', targets);

    // Export storage objects

    logger.info('Exporting storage objects');

    const { data: files } = await exportFiles(supabase, projectId);
    addDocumentsToZip(zip, files);

    const { data: iiif } = await exportIIIF(supabase, projectId);
    addDocumentsToZip(zip, iiif);

    // Create the zip file

    logger.info('Creating ZIP file');

    const file = zip.toBuffer();

    try {
      await uploadFile(supabase, jobId, file);
    } catch (error) {
      logger.error('Error uploading file');
      logger.error((error as Error).message);
    }
  }
});

const uploadFile = (
  supabase: SupabaseClient,
  name: string,
  file: Buffer
) => (
  supabase
    .storage
    .from('jobs')
    .upload(name, file)
);