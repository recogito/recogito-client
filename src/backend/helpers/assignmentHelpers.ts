import { getGroupMembers, zipMembers } from '@backend/crud';
import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
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
) =>
  supabase
    .from('contexts')
    .insert({
      name, description, project_id
    })
    .select()
    .single()
    .then(({ error, data }) => 
      ({ error, data: data as Context }));

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
    .from('layer_contexts')
    .select(`
      context:contexts (
        id,
        name,
        description,
        project_id
      ),
      layer:layers (
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
        ),
        groups:layer_groups (
          id,
          name,
          description
        )
      )
    `)
    .eq('context_id', contextId)
    .then(({ data, error }) => {
      if (error || data?.length < 1) {
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

        // As a next step, we'll fetch group members in a follow-up query
        const layerContexts = data;

        // All layer IDs of all layers in `data`
        const layerGroupIds = layerContexts.reduce((groupIds, { layer }) => {
          // @ts-ignore
          return [...groupIds, ...layer.groups.map(g => g.id)]
        }, [] as string[]);

        return getGroupMembers(supabase, layerGroupIds).then(({ error, data }) => {
          if (error) {
            return { error, data: undefined };
          } else {
            // @ts-ignore
            if (layerContexts.some(l => l.layer.document === null)) {
              // Just a bit of defensive programming - if any of the documents are not
              // visible to this users, something's wrong.
              return { error: { message: 'Documents returned empty' } as PostgrestError, data: undefined };
            } else {
              // Post-processing: create proper assignments data structure.
              // Note that the context is ALWAYS the same in each list entry
              // @ts-ignore
              const { id, name, description, project_id } = layerContexts[0].context;

              const layers = 
                layerContexts.map(({ layer }) => ({ 
                  ...layer,
                  // @ts-ignore
                  groups: zipMembers(layer.groups, data)
                }));

              return { 
                error: null,
                data: {
                  id, 
                  name, 
                  description,
                  project_id,
                  layers
                } as unknown as ExtendedAssignmentData
              }
            }
          }
        });        
      }
    });