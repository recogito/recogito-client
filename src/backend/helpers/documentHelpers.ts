import type { SupabaseClient } from '@supabase/supabase-js';
import { createDocument, createLayer } from '@backend/crud';
import type { Response } from '@backend/Types';
import type { Document, Layer } from 'src/Types';

/**
 * Initializes a new Document in a Context.
 * 
 * 1. creates the Document record.
 * 2. creates a default Layer on the document in the given Context.
 */
export const initDocument = (supabase: SupabaseClient, name: string, contextId: string) => {
  // First promise: create the document
  const a: Promise<Document> = new Promise((resolve, reject) => 
    createDocument(supabase, name)
      .then(({ error, data }) => {
        if (error)
          reject(error);
        else
          resolve(data);
      }));

  // Second promise: create layer in the default context
  const b: Promise<Layer> = a.then(document => 
    new Promise((resolve, reject) => 
      createLayer(supabase, document.id, contextId)
        .then(({ error, data }) => {
          if (error)
            reject(error);
          else
            resolve(data);
        })));

  return Promise.all([a, b]).then(([ document, defaultLayer ]) => 
    ({ document, defaultLayer }));
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
        context_id
      )
    `)
    .eq('layers.context_id', contextId)
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
      layers (
        id,
        created_at,
        created_by,
        updated_at,
        updated_by,
        document_id,
        context_id,
        name,
        description
      )
    `)
    .eq('id', documentId)
    .eq('layers.context_id', contextId)
    .single()
    .then(({ error, data }) => {
      if (data) {
        const { layers, ...document } = data;
        return { error, data: [document as Document, layers as Layer[]]};
      } else {
        return { error, data: undefined }
      }
    });
