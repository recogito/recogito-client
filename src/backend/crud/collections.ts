import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Collection } from 'src/Types';

export const getCollection = (
  supabase: SupabaseClient,
  collectionId: string
): Response<Collection> =>
  supabase
    .from('collections')
    .select()
    .eq('id', collectionId)
    .single()
    .then(({ error, data }) => ({ error, data: data as Collection }));

export const getInstanceCollections = (
  supabase: SupabaseClient,
): Response<Collection[]> =>
  supabase
    .from('collections')
    .select(`
      *,
      document_count:documents(count)
    `)
    .is('extension_id', null)
    .then(({ error, data }) => {
      return { error, data: data as Collection[] };
    });

export const createCollection = (
  supabase: SupabaseClient,
  name: string
): Response<Collection> =>
  supabase
    .from('collections')
    .insert({
      name,
    })
    .select()
    .single()
    .then(({ error, data }) => {
      return { error, data: data as Collection };
    });

export const updateCollection = (
  supabase: SupabaseClient,
  partial: { id: string; [key: string]: string | null }
): Response<Collection> =>
  supabase
    .from('collections')
    .update({ ...partial })
    .eq('id', partial.id)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Collection }));

export const archiveCollection = (
  supabase: SupabaseClient,
  collectionId: string
): Response<boolean> =>
  supabase
    .rpc('archive_collection_rpc', {
      _collection_id: collectionId,
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
          message: 'Failed to archive collection',
        } as PostgrestError,
        data: false,
      };
    });
