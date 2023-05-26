import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Document } from 'src/Types';

export const createDocument = (supabase: SupabaseClient, name: string): Response<Document> =>
  supabase
    .from('documents')
    .insert({
      name
    })
    .select()
    .single()
    .then(({ error, data }) => 
      ({ error, data: data as Document }));