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
  // resolve this project's document ids via project_documents (indexed on
  // project_id), then fetch documents by primary key
  const { data: projectDocs, error: projectDocsError } = await supabase
    .from('project_documents')
    .select('document_id')
    .eq('project_id', projectId);

  if (projectDocsError) return { data: null, error: projectDocsError };

  const documentIds = (projectDocs || [])
    .map((row) => row.document_id)
    .filter(Boolean);

  if (documentIds.length === 0) return { data: [], error: null };

  // fetch in chunks to prevent timeouts
  const CHUNK_SIZE = 500;
  const documents: unknown[] = [];

  for (let i = 0; i < documentIds.length; i += CHUNK_SIZE) {
    const chunk = documentIds.slice(i, i + CHUNK_SIZE);
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .in('id', chunk);

    if (error) return { data: null, error };
    if (data) documents.push(...data);
  }

  return { data: documents, error: null };
};

export const exportFiles = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: projectDocs } = await supabase
    .from('project_documents')
    .select('document_id')
    .eq('project_id', projectId);

  const documentIds = (projectDocs || [])
    .map((row) => row.document_id)
    .filter(Boolean);

  const files: Files = {};
  const CHUNK_SIZE = 500;

  for (let i = 0; i < documentIds.length; i += CHUNK_SIZE) {
    const chunk = documentIds.slice(i, i + CHUNK_SIZE);
    const { data: documents } = await supabase
      .from('documents')
      .select('id, bucket_id')
      .in('id', chunk)
      .eq('bucket_id', 'documents');

    for (const document of documents || []) {
      const buffer = await downloadStorage(supabase, document);

      if (buffer) {
        files[document.id] = buffer;
      }
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
  const { data: projectDocs } = await supabase
    .from('project_documents')
    .select('document_id')
    .eq('project_id', projectId);

  const documentIds = (projectDocs || [])
    .map((row) => row.document_id)
    .filter(Boolean);

  const files: Files = {};
  const CHUNK_SIZE = 500;

  for (let i = 0; i < documentIds.length; i += CHUNK_SIZE) {
    const chunk = documentIds.slice(i, i + CHUNK_SIZE);
    const { data: documents } = await supabase
      .from('documents')
      .select('id, meta_data')
      .in('id', chunk)
      .eq('meta_data->>protocol', 'IIIF_IMAGE');

    for (const document of documents || []) {
      const { url } = document.meta_data;
      const imageUrl = url.replace('/info.json', '/full/max/0/default.jpg');
      const buffer = await downloadFile(imageUrl);

      if (buffer) {
        files[document.id] = buffer;
      }
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
