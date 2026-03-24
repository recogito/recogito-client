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
  jobId: string;
  projectId?: string;
  token: string;
  publicSupabaseUrl: string;
  publicSupabaseApiKey: string;
}

const addToZip = (
  zip: AdmZip,
  filename: string,
  data: any | null = ''
) => {
  const content = JSON.stringify(data || '{}');
  zip.addFile(filename, Buffer.from(content, 'utf8'));
};

const addDocumentsToZip = (
  zip: AdmZip,
  files: { [key: string]: ArrayBuffer }
) => {
  Object.entries(files).forEach(([key, data]) => {
    zip.addFile(`documents/${key}`, Buffer.from(data));
  });
}

export const exportProject = task({
  id: 'export-project',
  run: async (payload: Payload) => {
    const { jobId, projectId, token, publicSupabaseUrl, publicSupabaseApiKey } = payload;

    if (!(publicSupabaseUrl && publicSupabaseApiKey)) {
      logger.error('Invalid Supabase credentials');
      return;
    }

    if (!projectId) {
      logger.error('Project ID is required');
      return;
    }

    logger.info('Creating Supabase client');

    const supabase = createClient(publicSupabaseUrl, publicSupabaseApiKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        }
      }
    });

    const zip = new AdmZip();

    // Export table data to CSV

    logger.info('Exporting data as JSON');

    const exportTasks = [
      { name: 'annotations.json', fn: exportAnnotations },
      { name: 'bodies.json', fn: exportBodies },
      { name: 'context_documents.json', fn: exportContextDocuments },
      { name: 'context_users.json', fn: exportContextUsers },
      { name: 'contexts.json', fn: exportContexts },
      { name: 'documents.json', fn: exportDocuments },
      { name: 'group_users.json', fn: exportGroupUsers },
      { name: 'layer_contexts.json', fn: exportLayerContexts },
      { name: 'layer_groups.json', fn: exportLayerGroups },
      { name: 'layers.json', fn: exportLayers },
      { name: 'profiles.json', fn: exportProfiles },
      { name: 'project_documents.json', fn: exportProjectDocuments },
      { name: 'project_groups.json', fn: exportProjectGroups },
      { name: 'projects.json', fn: exportProjects },
      { name: 'tag_definitions.json', fn: exportTagDefinitions },
      { name: 'tags.json', fn: exportTags },
      { name: 'targets.json', fn: exportTargets },
    ];

    for (const task of exportTasks) {
      // run each export function and throw on any errors
      const { data, error } = await task.fn(supabase, projectId);
      if (error) {
        throw new Error(`Failed to export ${task.name}: ${error.message}`);
      }
      addToZip(zip, task.name, data);
    }

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
      throw new Error(`Error uploading file: ${(error as Error).message}`);
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
    .upload(name, file, {
      contentType: 'application/zip'
    })
);
