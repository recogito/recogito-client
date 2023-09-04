import type { SupabaseClient } from '@supabase/supabase-js';
import type { Context, ExtendedAssignmentData } from 'src/Types';

/**
 * An assignment is just an untagged context.
 */
export const createAssignmentContext = (supabase: SupabaseClient, name: string, project_id: string) =>
  supabase
    .from('contexts')
    .insert({
      name, project_id
    })
    .select()
    .single()
    .then(({ error, data }) => 
      ({ error, data: data as Context }));

/**
 * Archives an assigment context and all associated entities.
 */
export const archiveAssignment = (
  supabase: SupabaseClient, 
  contextId: string
): Promise<void> => {
  // TODO because layers can be in multiple contexts, 
  // they don't get archived automatically
  return new Promise((resolve, reject) => {
    supabase
      .rpc('archive_record_rpc', {
        _table_name: 'contexts',
        _id: contextId
      })
      .then(({ error }) => {
        if (error)
          reject(error)
        else
          resolve();
      })
  })
}