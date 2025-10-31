import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { CollectionMetadata, Document, ProjectDocument } from 'src/Types';
import { DOCUMENTS_PER_FETCH } from '@components/DocumentLibrary';

export const createDocument = (
  supabase: SupabaseClient,
  name: string,
  is_private: boolean,
  content_type?: string,
  meta_data?: object,
  collection_id?: string | null,
  collection_metadata?: CollectionMetadata | null,
): Response<Document> =>
  supabase
    .from('documents')
    .insert({
      name,
      content_type,
      bucket_id: content_type ? 'documents' : undefined,
      meta_data,
      is_private,
      collection_id,
      collection_metadata,
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

export const getCollectionDocuments = (
  supabase: SupabaseClient,
  collectionId: string
): Response<Document[]> =>
  supabase
    .from('documents')
    .select('*', { count: 'exact', head: true })
    .eq('collection_id', collectionId)
    .then(({ count, error }) => {
      if (error) {
        return { error, data: [] };
      }
      let start = 0;
      const iterations = Math.ceil((count || 0) / DOCUMENTS_PER_FETCH);
      const fetches = [];

      for (let i = 0; i < iterations; i++) {
        fetches.push(
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
              is_private,
              collection_id,
              collection_metadata
              `
            )
            .eq('collection_id', collectionId)
            .range(start, start + DOCUMENTS_PER_FETCH - 1)
        );
        start += DOCUMENTS_PER_FETCH;
      }

      return Promise.all(fetches).then((responses) => {
        return {
          data: responses.flatMap((r) => r.data) as Document[],
          error: responses.find((r) => r.error)?.error || null,
        };
      });
    });
