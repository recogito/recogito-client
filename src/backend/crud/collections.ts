import type { SupabaseClient } from '@supabase/supabase-js';
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
