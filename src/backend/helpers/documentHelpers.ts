import type { SupabaseClient } from '@supabase/supabase-js';
import { createDocument } from '@backend/crud';
import { createLayerInContext } from './layerHelpers';
import { uploadFile } from '@backend/storage';
import type { Response } from '@backend/Types';
import type { Document, DocumentInContext, Layer } from 'src/Types';

/**
 * Initializes a new Document in a Context.
 * 
 * 1. creates the Document record.
 * 2. creates a default Layer on the document in the given Context.
 */
export const initDocument = (
  supabase: SupabaseClient, 
  name: string, 
  projectId: string, 
  contextId: string,
  onProgress?: (progress: number) => void,
  file?: File,
  url?: string
): Promise<DocumentInContext> => {
  // First promise: create the document
  const a: Promise<Document> = new Promise((resolve, reject) => 
    createDocument(supabase, name, file?.type, { protocol: 'IIIF_IMAGE', url })
      .then(({ error, data }) => {
        if (error)
          reject(error);
        else
          resolve(data);
      }));

  // Second promise: create layer in the default context
  const b: Promise<Layer> = a.then(document => 
    createLayerInContext(supabase, document.id, projectId, contextId));

  return Promise.all([a, b])
    .then(([ document, defaultLayer ]) => {
      if (file) {
        return uploadFile(supabase, file, document.id, onProgress)
          .then(() => ({ ...document, layers: [defaultLayer] }));
      } else {
        return { ...document, layers: [ defaultLayer ] };
      }
    })
}

export const listDocumentsInProject = (
  supabase: SupabaseClient,
  projectId: string
): Response<DocumentInContext[]> =>
  supabase
    .from('documents')
    .select(`
      id,
      created_at,
      created_by,
      updated_at,
      updated_by,
      name,
      bucket_id,
      content_type,
      meta_data,
      layers!inner (
        id,
        document_id,
        project_id,
        name,
        description,
        contexts:layer_contexts!inner (
          ...contexts (
            id,
            name,
            project_id
          )
        )
      )
    `)
    .eq('layers.project_id', projectId)
    .then(({ error, data }) => 
      error ? ({ error, data: [] }) : ({ error, data: data as unknown as DocumentInContext[] }));

export const listDocumentsInContext = (
  supabase: SupabaseClient,
  contextId: string
): Response<DocumentInContext[]> =>
  supabase
    .from('documents')
    .select(`
      id,
      created_at,
      created_by,
      updated_at,
      updated_by,
      name,
      bucket_id,
      content_type,
      meta_data,
      layers!inner (
        id,
        document_id,
        project_id,
        name,
        description,
        contexts:layer_contexts!inner (
          ...contexts (
            id,
            name,
            project_id
          )
        )
      )
    `)
    .eq('layers.layer_contexts.context_id', contextId)
    .then(({ error, data }) => 
      error ? ({ error, data: [] }) : ({ error, data: data as unknown as DocumentInContext[] }));

export const getDocumentInContext = (
  supabase: SupabaseClient,
  documentId: string, 
  contextId: string
): Response<DocumentInContext | undefined> =>
  supabase
    .from('documents')
    .select(`
      id,
      created_at,
      created_by,
      updated_at,
      updated_by,
      name,
      bucket_id,
      content_type,
      meta_data,
      layers!inner (
        id,
        document_id,
        project_id,
        name,
        description,
        contexts:layer_contexts!inner (
          ...contexts (
            id,
            name, 
            project_id
          )
        )
      )
    `)
    .eq('id', documentId)
    .eq('layers.layer_contexts.context_id', contextId)
    .single()
    .then(({ error, data }) => 
      error ? ({ error, data: undefined }) : ({ error, data: data as unknown as DocumentInContext }));