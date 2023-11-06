import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Layer, LayerWithDocument, UserProfile } from 'src/Types';

export const createLayerInContext = (
  supabase: SupabaseClient, 
  document_id: string, 
  project_id: string,
  context_id: string,
  name?: string,
  description?: string
): Promise<Layer> => 
  new Promise((resolve, reject) => {
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
      .then(({ error, data }) => {
        const layer = data as Layer;

        if (error || !data) {
          reject(error);
        } else {
          supabase
            .from('layer_contexts')
            .insert({
              layer_id: layer.id,
              context_id
            })
            .select()
            .single()
            .then(({ error, data }) => {
              if (error || !data) {
                reject(error);
              } else {
                resolve(layer);
              }
            });
        }
      });
  });

export const addUsersToLayer = (
  supabase: SupabaseClient,
  layerId: string,
  groupName: string,
  users: UserProfile[]
): Promise<void> => new Promise((resolve, reject) => {
  // Step 1. get layer group with the given name
  supabase
    .from('layer_groups')
    .select(`
      id,
      name
    `)
    .eq('layer_id', layerId)
    .eq('name', groupName)
    .then(({ error, data }) => {
      if (error || data?.length !== 1) {
        reject(error);
      } else {
        const groupId = data[0].id;

        const records = users.map(user => ({
          user_id: user.id,
          group_type: 'layer',
          type_id: groupId
        }));

        // Step 2. add users to this group
        supabase
          .from('group_users')
          .insert(records)
          .then(({ error }) => {
            if (error)
              reject(error)
            else 
              resolve();
          });
      }
    });
});

export const removeUsersFromLayer = (
  supabase: SupabaseClient,
  layerId: string,
  groupName: string,
  users: UserProfile[]
): Promise<void> => new Promise((resolve, reject) => {
  // Step 1. get layer group with the given name
  supabase
    .from('layer_groups')
    .select(`
      id,
      name
    `)
    .eq('layer_id', layerId)
    .eq('name', groupName)
    .then(({ error, data }) => {
      if (error || data?.length !== 1) {
        reject(error);
      } else {
        const groupId = data[0].id;
        const userIds = users.map(user => user.id);

        // Step 2. remove users from this group
        supabase
          .from('group_users')
          .delete()
          .in('user_id', userIds)
          .then(({ error }) => {
            if (error)
              reject(error)
            else 
              resolve();
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
    .select(`
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
    `)
    .eq('project_id', projectId)
    .eq('document_id', documentId)
    .then(({ data, error }) => {
      if (error) {
        return { error, data: [] };
      } else {
        // @ts-ignore
        const flattened = data?.map(({ contexts, ...layer}) => ({ ...layer, context: contexts[0] }));
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
    .select(`
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
    `)
    .eq('project_id', projectId)
    .then(({ data, error }) => {
      if (error) {
        return { error, data: [] };
      } else {
        // @ts-ignore
        const flattened = data?.map(({ contexts, ...layer}) => ({ ...layer, context: contexts[0] }));
        return { error, data: flattened as unknown as LayerWithDocument[] };
      }
    });
    
/**
 * Returns ALL layers for ALL documents
 * in the given context.
 */
export const getAllLayersInContext = (
  supabase: SupabaseClient,
  contextId: string
): Response<Layer[]> =>
  supabase
    .from('layers')
    .select(`
      id,  
      document_id, 
      project_id, 
      name,
      description,
      contexts:layer_contexts!inner (
        context_id,
        ...contexts (
          id,
          name,        
          project_id
        )
      )
    `)
    .eq('layer_contexts.context_id', contextId)
    .then(({ data, error }) => {
      if (error) {
        return { error, data: [] };
      } else {
        // @ts-ignore
        const flattened = data?.map(({ contexts, ...layer}) => ({ ...layer, context: contexts[0] }));
        return { error, data: flattened as unknown as Layer[] };
      }
    });
