import type { SupabaseClient } from '@supabase/supabase-js';
import { createDocument, createLayer } from '@backend/crud';
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

