import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { LayerWithDocument, UserProfile } from 'src/Types';

export const addUsersToLayer = (
  supabase: SupabaseClient,
  layerId: string,
  adminOrDefault: 'admin' | 'default',
  users: UserProfile[]
): Promise<void> =>
  new Promise((resolve, reject) => {
    // Step 1. get layer group with the given name
    supabase
      .from('layer_groups')
      .select(
        `
      id,
      name
    `
      )
      .eq('layer_id', layerId)
      .eq(adminOrDefault === 'admin' ? 'is_admin' : 'is_default', true)
      .then(({ error, data }) => {
        if (error || data?.length !== 1) {
          reject(error);
        } else {
          const groupId = data[0].id;

          const records = users.map((user) => ({
            user_id: user.id,
            group_type: 'layer',
            type_id: groupId,
          }));

          // Step 2. add users to this group
          supabase
            .from('group_users')
            .insert(records)
            .then(({ error }) => {
              if (error) reject(error);
              else resolve();
            });
        }
      });
  });

export const removeUsersFromLayer = (
  supabase: SupabaseClient,
  layerId: string,
  adminOrDefault: 'admin' | 'default',
  users: UserProfile[]
): Promise<void> =>
  new Promise((resolve, reject) => {
    // Step 1. get layer group with the given name
    supabase
      .from('layer_groups')
      .select(
        `
      id,
      name
    `
      )
      .eq('layer_id', layerId)
      .eq(adminOrDefault === 'admin' ? 'is_admin' : 'is_default', true)
      .then(({ error, data }) => {
        if (error || data?.length !== 1) {
          reject(error);
        } else {
          const userIds = users.map((user) => user.id);

          // Step 2. remove users from this group
          supabase
            .from('group_users')
            .delete()
            .in('user_id', userIds)
            .then(({ error }) => {
              if (error) reject(error);
              else resolve();
            });
        }
      });
  });

/**
 * Retrieves all layers on the given documents
 * in this project.
 */
export const getAllDocumentLayersInProject = (
  supabase: SupabaseClient,
  documentId: string,
  projectId: string
): Response<LayerWithDocument[]> =>
  supabase
    .from('layers')
    .select(
      `
      id, 
      document_id,
      document:documents (
        *
      ),
      project_id, 
      name,
      description,
      contexts:layer_contexts (
        ...contexts (
          id,
          name,        
          project_id
        )
      )
    `
    )
    .eq('project_id', projectId)
    .eq('document_id', documentId)
    .then(({ data, error }) => {
      if (error) {
        return { error, data: [] };
      } else {
        // @ts-ignore
        const flattened = data?.map(({ contexts, ...layer }) => ({
          ...layer,
          context: contexts[0],
        }));
        return { error, data: flattened as unknown as LayerWithDocument[] };
      }
    });

/**
 * Returns ALL layers for ALL documents
 * in this project.
 */
export const getAllLayersInProject = (
  supabase: SupabaseClient,
  projectId: string
): Response<LayerWithDocument[]> =>
  supabase
    .from('layers')
    .select(
      `
      id,  
      document_id, 
      document:documents (
        *
      ),
      project_id, 
      name,
      description,
      contexts:layer_contexts (
        ...contexts (
          id,
          name,        
          project_id
        )
      )
    `
    )
    .eq('project_id', projectId)
    .then(({ data, error }) => {
      if (error) {
        return { error, data: [] };
      } else {
        // @ts-ignore
        const flattened = data?.map(({ contexts, ...layer }) => ({
          ...layer,
          context: contexts[0],
        }));
        return { error, data: flattened as unknown as LayerWithDocument[] };
      }
    });

export const addReadOnlyLayersToContext = (
  supabase: SupabaseClient,
  contextId: string,
  layerIds: string[]
): Response<boolean> =>
  supabase
    .rpc('add_read_only_layers_rpc', {
      _context_id: contextId,
      _layer_ids: layerIds,
    })
    .then(({ data, error }) => {
      if (error) {
        return { error, data: false };
      } else {
        return { error, data };
      }
    });

export const removeReadOnlyLayersFromContext = (
  supabase: SupabaseClient,
  contextId: string,
  layerIds: string[]
): Response<boolean> =>
  supabase
    .rpc('remove_read_only_layers_rpc', {
      _context_id: contextId,
      _layer_ids: layerIds,
    })
    .then(({ data, error }) => {
      if (error) {
        return { error, data: false };
      } else {
        return { error, data };
      }
    });
