import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Layer } from 'src/Types';

export const createLayer = (
  supabase: SupabaseClient, 
  document_id: string, 
  project_id: string,
  name?: string,
  description?: string
): Response<Layer> =>
  supabase
    .from('layers')
    .insert({
      document_id,
      project_id,
      name,
      description
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Layer }));

export const archiveLayer = (supabase: SupabaseClient, id: string): Promise<void> =>
  new Promise((resolve, reject) => {
    supabase
      .rpc('archive_record_rpc', {
        _table_name: 'layers',
        _id: id
      })
      .then(({ error }) => {
        if (error)
          reject(error);
        else
          resolve();
      })
  });