import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tag, TagDefinition } from 'src/Types';

export const findTagDefinition = (
  supabase: SupabaseClient,
  name: string, 
  scope: 'system' | 'organization' | 'project',
  scopeId?: string
) =>
  scopeId ? 
    supabase
     .from('tag_definitions')
     .select()
     .eq('name', name)
     .eq('scope', scope)
     .eq('scope_id', scopeId)
     .single()
     .then(({ error, data }) => ({ error, data: data as TagDefinition })) :

    supabase
      .from('tag_definitions')
      .select()
      .eq('name', name)
      .eq('scope', scope)
      .single()
      .then(({ error, data }) => ({ error, data: data as TagDefinition }));

export const createTag = (supabase: SupabaseClient, tag_definition_id: string, target_id: string) =>
  supabase
    .from('tags')
    .insert({
      tag_definition_id,
      target_id
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Tag }));

export const createTagDefinition = (
  supabase: SupabaseClient,
  tagDefinition: {
    name: string,
    scope: string,
    scope_id: string,
    target_type: string
  }
): Promise<TagDefinition> => {
  return new Promise((resolve, reject) => {
    supabase
      .from('tag_definitions')
      .insert(tagDefinition)
      .select(`
        id,
        name,
        target_type,
        scope,  
        scope_id,
        metadata,
        tags (
          id,
          tag_definition_id,
          target_id
        )
    `)
      .single()
      .then(({ error, data }) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      })
  });
};

export const updateTagDefinition = (
  supabase: SupabaseClient,
  tagDefinitionId: string,
  name: string
) => new Promise((resolve, reject) => (
  supabase
    .from('tag_definitions')
    .update({ name })
    .eq('id', tagDefinitionId)
    .select(`
      id,
      name,
      target_type,
      scope,  
      scope_id,
      metadata,
      tags (
        id,
        tag_definition_id,
        target_id
      )
    `)
    .single()
    .then(({ error, data }) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    })
));