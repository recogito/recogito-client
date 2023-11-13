import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Context } from 'src/Types';

export const createContext = (supabase: SupabaseClient, project_id: string, name?: string): Response<Context> =>
  supabase
    .from('contexts')
    .insert({
      name, project_id
    })
    .select()
    .single()
    .then(({ error, data }) => 
      ({ error, data: data as Context }));

export const deleteContext = (supabase: SupabaseClient, id: string) => 
  supabase
    .from('contexts')
    .delete()
    .match({ id })
    .select();

    