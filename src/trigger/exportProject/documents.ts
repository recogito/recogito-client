import { getDownloadURL } from '@backend/storage';
import type { SupabaseClient } from '@supabase/supabase-js';
import { logger } from '@trigger.dev/sdk/v3';

interface Files {
  [key: string]: ArrayBuffer;
}

const downloadFile = async (url: string) => {
  let data;

  try {
    const response = await fetch(url);
    data = await response.arrayBuffer();
  } catch (e: any) {
    logger.error('Error downloading document');
    logger.error(e.message);
  }

  return data;
};

const downloadStorage = async (
  supabase: SupabaseClient,
  document: { id: string }
) => {
  let data;

  try {
    const url = await getDownloadURL(supabase, document.id);
    data = await downloadFile(url);
  } catch (e: any) {
    logger.error('Error obtaining download URL');
    logger.error(e.message);
  }

  return data;
};

export const exportDocuments = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  // get documents by inner join against project_documents
  const { data, error } = await supabase
    .from('documents')
    .select('*, project_documents!inner(project_id)')
    .eq('project_documents.project_id', projectId);

  // strip out join metadata
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const cleanData = data?.map(({ project_documents, ...rest }) => rest) || [];

  return { data: cleanData, error };
};

export const exportFiles = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  // get documents by inner join against project_documents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, bucket_id, project_documents!inner(project_id)')
    .eq('project_documents.project_id', projectId)
    .eq('bucket_id', 'documents');

  const files: Files = {};

  for (const document of documents || []) {
    const buffer = await downloadStorage(supabase, document);

    if (buffer) {
      files[document.id] = buffer;
    }
  }

  return {
    data: files,
  };
};

export const exportIIIF = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  // get documents by inner join against project_documents
  const { data: documents } = await supabase
    .from('documents')
    .select('id, meta_data, project_documents!inner(project_id)')
    .eq('project_documents.project_id', projectId)
    .eq('meta_data->>protocol', 'IIIF_IMAGE');

  const files: Files = {};

  for (const document of documents || []) {
    const { url } = document.meta_data;
    const imageUrl = url.replace('/info.json', '/full/max/0/default.jpg');
    const buffer = await downloadFile(imageUrl);

    if (buffer) {
      files[document.id] = buffer;
    }
  }

  return {
    data: files,
  };
};

export const exportProjectDocuments = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  return supabase
    .from('project_documents')
    .select()
    .eq('project_id', projectId);
};
