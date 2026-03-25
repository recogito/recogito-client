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
import * as sdk from '@1password/sdk';

interface Payload {
  jobId: string;
  projectId?: string;
  publicSupabaseUrl: string;
  publicSupabaseApiKey: string;
  vaultTenantPath?: string;
}

const getSecrets = async (vaultTenantPath?: string) => {
  // allow multi-tenant setup with 1password service account and vault path
  const isMultiTenant =
    process.env.MULTI_TENANT === 'true' && process.env.OP_SERVICE_ACCOUNT_TOKEN;

  if (!isMultiTenant || !vaultTenantPath) {
    // otherwise just use env vars
    return {
      SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY || '',
    };
  }
  const client = await sdk.createClient({
    auth: process.env.OP_SERVICE_ACCOUNT_TOKEN!,
    integrationName: 'Trigger.dev import-export multi-tenant',
    integrationVersion: '1.0.0',
  });
  const SUPABASE_SERVICE_KEY = await client.secrets.resolve(
    `op://${vaultTenantPath}/SUPABASE_SERVICE_KEY`
  );
  return { SUPABASE_SERVICE_KEY };
};

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
};

export const exportProject = task({
  id: 'export-project',
  run: async (payload: Payload) => {
    const {
      jobId,
      projectId,
      publicSupabaseUrl,
      publicSupabaseApiKey,
      vaultTenantPath,
    } = payload;

    if (!(publicSupabaseUrl && publicSupabaseApiKey)) {
      throw new Error('Invalid Supabase credentials');
    }

    if (!projectId) {
      throw new Error('Project ID is required');
    }

    logger.info('Creating Supabase client');

    const { SUPABASE_SERVICE_KEY } = await getSecrets(vaultTenantPath);

    if (!SUPABASE_SERVICE_KEY) {
      throw new Error('Missing Supabase service key');
    }

    const supabase = createClient(publicSupabaseUrl, SUPABASE_SERVICE_KEY);

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
  },
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
