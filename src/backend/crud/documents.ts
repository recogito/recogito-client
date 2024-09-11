import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
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
): Response<ProjectDocument | undefined> =>
  supabase
    .rpc('add_documents_to_project_rpc', {
      _document_ids: [documentId],
      _project_id: projectId,
    })
    .then(({ data }) => {
      if (data) {
        return {
          error: null,
          data: { project_id: projectId, document_id: documentId },
        };
      }
      return {
        error: {
          message: 'Failed to create project document',
        } as PostgrestError,
        data: undefined,
      };
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

export const archiveDocument = (
  supabase: SupabaseClient,
  documentId: string
): Response<boolean> =>
  supabase
    .rpc('archive_document_rpc', {
      _document_id: documentId,
    })
    .then(({ data }) => {
      if (data) {
        return {
          error: null,
          data: true,
        };
      }
      return {
        error: {
          message: 'Failed to archive document',
        } as PostgrestError,
        data: false,
      };
    });

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
