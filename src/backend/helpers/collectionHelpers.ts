import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { CollectionMetadata, Document } from 'src/Types';

export interface CopiedDocument extends Document {
  original_document_id: string;
}

export const copyDocumentsToCollection = (
  supabase: SupabaseClient,
  collectionId: string,
  documentIds: string[],
  collection_metadata: CollectionMetadata,
): Response<CopiedDocument[] | undefined> =>
  supabase
    .rpc('copy_documents_to_collection_rpc', {
      _document_ids: documentIds,
      _collection_id: collectionId,
      _collection_metadata: collection_metadata,
    })
    .then(({ data, error }) => {
      if (data) {
        if (error) {
          return {
            error,
            data: [],
          };
        }
        return { data, error: null };
      } else {
        return {
          error: error,
          data: undefined,
        };
      }
    });
