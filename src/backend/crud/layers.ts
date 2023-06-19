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