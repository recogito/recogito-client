import type { SupabaseClient } from '@supabase/supabase-js';
import { createDocument } from '@backend/crud';
import { createLayerInContext } from './layerHelpers';
import { uploadFile } from '@backend/storage';
import type { Response } from '@backend/Types';
import type { Document, Layer } from 'src/Types';

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
) => {
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
          .then(() => ({ document, defaultLayer }));
      } else {
        return { document, defaultLayer };
      }
    })
}

/**
 * Lists all documents that have layers in the given context.
 */
export const listDocumentsInContext = (
  supabase: SupabaseClient,
  contextId: string
): Response<Document[]> =>
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
      layers!inner (
        id,
        document_id,
        layer_contexts!inner (
          context_id
        )
      )
    `)
    .eq('layers.layer_contexts.context_id', contextId)
    .then(({ error, data }) => {
      if (error) {
        return { error, data: [] };
      } else {
        const documents = data.map(d => { 
          const { layers, ...document } = d;
          return document;
        });

        return { error, data: documents };
      }
    });
    
export const getDocumentInContext = (
  supabase: SupabaseClient,
  documentId: string, 
  contextId: string
): Response<[Document, Layer[]] | undefined> =>
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
      layers!inner (
        id,
        created_at,
        created_by,
        updated_at,
        updated_by,
        document_id,
        name,
        description,
        layer_contexts!inner (
          context_id
        )
      )
    `)
    .eq('id', documentId)
    .eq('layers.layer_contexts.context_id', contextId)
    .single()
    .then(({ error, data }) => {
      if (data) {
        const { layers, ...document } = data;
        return { error, data: [document as Document, layers as Layer[]]};
      } else {
        return { error, data: undefined }
      }
    });