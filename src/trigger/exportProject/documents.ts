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
}

const getDocumentIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: projectDocuments } = await supabase
    .from('project_documents')
    .select('document_id')
    .eq('project_id', projectId);

  return projectDocuments?.map((projectDocument) => projectDocument.document_id) || [];
};

export const exportDocuments = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const documentIds = await getDocumentIds(supabase, projectId);

  return supabase
    .from('documents')
    .select()
    .in('id', documentIds)
    .csv();
};

export const exportFiles = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const documentIds = await getDocumentIds(supabase, projectId);

  const { data: documents } = await supabase
    .from('documents')
    .select('id')
    .in('id', documentIds)
    .eq('bucket_id', 'documents');

  const files: Files = {};

  for (const document of (documents || [])) {
    const buffer = await downloadStorage(supabase, document);

    if (buffer) {
      files[document.id] = buffer;
    }
  }

  return {
    data: files
  };
};

export const exportIIIF = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const documentIds = await getDocumentIds(supabase, projectId);

  const { data: documents } = await supabase
    .from('documents')
    .select('id, meta_data')
    .in('id', documentIds)
    .eq('meta_data->>protocol', 'IIIF_IMAGE');

  const files: Files = {};

  for (const document of (documents || [])) {
    const { url } = document.meta_data;
    const imageUrl = url.replace('/info.json', '/full/max/0/default.jpg');
    const buffer = await downloadFile(imageUrl);

    if (buffer) {
      files[document.id] = buffer;
    }
  }

  return {
    data: files
  };
};

export const exportProjectDocuments = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const documentIds = await getDocumentIds(supabase, projectId);

  return supabase
    .from('project_documents')
    .select()
    .eq('project_id', projectId)
    .in('document_id', documentIds)
    .csv();
};