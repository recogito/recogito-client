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

interface Payload {
  key: string;
  jobId: string;
  projectId?: string;
  serverURL: string;
  token: string;
}

const addToZip = (
  zip: AdmZip,
  filename: string,
  data: string | null = ''
) => {
  zip.addFile(filename, Buffer.alloc(data?.length || 0, data || ''));
};

const addFilesToZip = (
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
    const {
      key,
      jobId,
      projectId,
      serverURL,
      token
    } = payload;

    if (!projectId) {
      logger.error('Project ID is required');
      return;
    }

    logger.info('Creating Supabase client');

    const supabase = createClient(serverURL, key, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    });

    const zip = new AdmZip();

    // Export table data to CSV

    logger.info('Exporting data as CSV');

    const { data: annotations } = await exportAnnotations(supabase, projectId);
    addToZip(zip, 'annotations.csv', annotations);

    const { data: bodies } = await exportBodies(supabase, projectId);
    addToZip(zip, 'bodies.csv', bodies);

    const { data: contexts } = await exportContexts(supabase, projectId);
    addToZip(zip, 'contexts.csv', contexts);

    const { data: contextDocuments } = await exportContextDocuments(supabase, projectId);
    addToZip(zip, 'context_documents.csv', contextDocuments);

    const { data: contextUsers } = await exportContextUsers(supabase, projectId);
    addToZip(zip, 'context_users.csv', contextUsers);

    const { data: documents } = await exportDocuments(supabase, projectId);
    addToZip(zip, 'documents.csv', documents);

    const { data: groupUsers } = await exportGroupUsers(supabase, projectId);
    addToZip(zip, 'group_users.csv', groupUsers);

    const { data: layers } = await exportLayers(supabase, projectId);
    addToZip(zip, 'layers.csv', layers);

    const { data: layerContexts } = await exportLayerContexts(supabase, projectId);
    addToZip(zip, 'layer_contexts.csv', layerContexts);

    const { data: layerGroups } = await exportLayerGroups(supabase, projectId);
    addToZip(zip, 'layer_groups.csv', layerGroups);

    const { data: profiles } = await exportProfiles(supabase, projectId);
    addToZip(zip, 'profiles.csv', profiles);

    const { data: projects } = await exportProjects(supabase, projectId);
    addToZip(zip, 'projects.csv', projects);

    const { data: projectDocuments } = await exportProjectDocuments(supabase, projectId);
    addToZip(zip, 'project_documents.csv', projectDocuments);

    const { data: projectGroups } = await exportProjectGroups(supabase, projectId);
    addToZip(zip, 'project_groups.csv', projectGroups);

    const { data: tagDefinitions } = await exportTagDefinitions(supabase, projectId);
    addToZip(zip, 'tag_definitions.csv', tagDefinitions);

    const { data: tags } = await exportTags(supabase, projectId);
    addToZip(zip, 'tags.csv', tags);

    const { data: targets } = await exportTargets(supabase, projectId);
    addToZip(zip, 'targets.csv', targets);

    // Export storage objects

    logger.info('Exporting storage objects');

    const { data: files } = await exportFiles(supabase, projectId);
    addFilesToZip(zip, files);

    const { data: iiif } = await exportIIIF(supabase, projectId);
    addFilesToZip(zip, iiif);

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