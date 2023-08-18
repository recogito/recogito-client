import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context } from 'src/Types';

export const createAssignmentContext = (supabase: SupabaseClient, name: string, project_id: string) =>
  // An assignment is just an untagged context
  supabase
    .from('contexts')
    .insert({
      name, project_id
    })
    .select()
    .single()
    .then(({ error, data }) => 
      ({ error, data: data as Context }));