import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Context, ExtendedAssignmentData } from 'src/Types';

/**
 * An assignment is just an untagged context.
 */
export const createAssignmentContext = (
  supabase: SupabaseClient,
  name: string,
  description: string | undefined,
  project_id: string
): Response<Context> =>
  supabase.rpc('create_context_rpc', { _description: description, _name: name, _project_id: project_id })
    .then(({ data, error }) => ({ error, data: data[0] as Context }));

export const updateAssignmentContext = (
  supabase: SupabaseClient,
  contextId: string,
  name: string,
  description?: string
) =>
  supabase
    .from('contexts')
    .update({
      name, description
    })
    .eq('id', contextId)
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

export const getAssignment = (
  supabase: SupabaseClient,
  contextId: string
): Response<ExtendedAssignmentData | undefined> =>
  // Note that supabase JS doesn't support group by, which is
  // why we're joining in the same context for each layer, and
  // then do some post processing 'manually'.
  supabase
    .from('contexts')
    .select(`
      id,
      name,
      description,
      project_id,
      team:context_users (
        user_id,
        profile:user_id(
          id,
          nickname,
          first_name,
          last_name,
          avatar_url
        )
      ),
      layer_contexts (
        id,
        layer:layer_id(
          id,
          name,
          description,
          document:documents (
            id,
            created_at,
            created_by,
            updated_at,
            updated_by,
            bucket_id,
            name,
            content_type,
            meta_data
          )            
        )
      )
    `)
    .eq('id', contextId)
    .single()
    .then(({ data, error }) => {
      if (error) {
        return { error, data: undefined };
      } else {
        // Returns a nested list with objects of the following shape:
        // { 
        //    context: ..., 
        //    layer: {
        //      id, name, description,
        //      document: { },
        //      layer_groups: [{
        //        id, name, description
        //      }]
        //    }
        // }

        const obj: ExtendedAssignmentData = {
          id: data.id,
          name: data.name,
          description: data.description,
          project_id: data.project_id,
          team: data.team.map(t => {
            return {
              user: { ...t.profile, id: t.user_id },
              since: '',
            }
          }),
          // @ts-ignore
          layers: data.layer_contexts.map(l => {
            return { ...l.layer, id: l.id }
          })
        }

        return {
          error: null,
          data: obj,
        }
      }
    });