import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Document, ProjectDocument } from 'src/Types';

export const createDocument = (
  supabase: SupabaseClient,
  name: string,
  content_type?: string,
  meta_data?: object
): Response<Document> =>
  supabase
    .from('documents')
    .insert({
      name,
      content_type,
      bucket_id: content_type ? 'documents' : undefined,
      meta_data,
    })
    .select()
    .single()
    .then(({ error, data }) => {
      return { error, data: data as Document };
    });

export const createProjectDocument = (
  supabase: SupabaseClient,
  documentId: string,
  projectId: string
): Response<ProjectDocument> =>
  supabase
    .from('project_documents')
    .insert({
      project_id: projectId,
      document_id: documentId,
    })
    .select()
    .single()
    .then(({ error, data }) => {
      return { error, data: data as ProjectDocument };
    });

export const renameDocument = (
  supabase: SupabaseClient,
  documentId: string,
  name: string
): Response<Document> =>
  supabase
    .from('documents')
    .update({ name })
    .eq('id', documentId)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Document }));

export const updateDocumentMetadata = (
  supabase: SupabaseClient,
  documentId: string,
  name: string,
  meta_data: object
): Response<Document> =>
  supabase
    .from('documents')
    .update({ name, meta_data })
    .eq('id', documentId)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Document }));

export const setDocumentPrivacy = (
  supabase: SupabaseClient,
  documentId: string,
  isPrivate: boolean
): Response<Document> =>
  supabase
    .from('documents')
    .update({ is_private: isPrivate })
    .eq('id', documentId)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Document }));

export const getDocument = (
  supabase: SupabaseClient,
  documentId: string
): Response<Document> =>
  supabase
    .from('documents')
    .select(
      `
      id,
      created_at,
      created_by,
      updated_at,
      updated_by,
      name,
      bucket_id,
      content_type,
      meta_data,
      is_private
    `
    )
    .eq('id', documentId)
    .single()
    .then(({ error, data }) => ({ error, data: data as Document }));
