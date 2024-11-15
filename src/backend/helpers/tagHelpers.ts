import type { Response } from '@backend/Types';
import { createTag, findTagDefinition } from '@backend/crud/tags';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tag, TagDefinition, VocabularyTerm } from 'src/Types';

export const createSystemTag = (
  supabase: SupabaseClient, 
  name: string, 
  target_id: string
): Promise<Tag> => new Promise((resolve, reject) => 
  findTagDefinition(supabase, name, 'system').then(({ error, data }) => {
    if (error || !(data)) {
      reject(error)
    } else {
      createTag(supabase, data.id, target_id).then(({ error, data }) => {
        if (error || !(data)) {
          reject(error);
        } else {
          resolve(data);
        }
      });
    }
  }));

export const getTagsForContext = (
  supabase: SupabaseClient, 
  contextId: string
): Response<Tag[]> =>
  supabase
    .from('tags')
    .select(`
      id,
      created_at,
      created_by,
      target_id,
      tag_definition:tag_definitions(
        id,
        name,
        target_type,
        scope,
        scope_id
      )
    `)
    .eq('target_id', contextId)
    .eq('tag_definitions.scope', 'system')
    .then(({ error, data }) => error || !data ?
      ({ error, data: [] }) : ({ error, data: data as unknown as Tag[] }));

export const getTagsForContexts = (
  supabase: SupabaseClient, 
  contextIds: string[]
): Response<Tag[]> => 
  supabase
    .from('tags')
    .select(`
      id,
      created_at,
      created_by,
      target_id,
      tag_definition:tag_definitions(
        id,
        name,
        target_type,
        scope,
        scope_id
      )
    `)
    .in('target_id', contextIds)
    .eq('tag_definitions.scope', 'system')
    .then(({ error, data }) => error || !data ?
      ({ error, data: [] }) : ({ error, data: data as unknown as Tag[] }));

export const getProjectTagVocabulary = (
  supabase: SupabaseClient,
  projectId: string
): Response<VocabularyTerm[]> =>
  supabase
    .from('tag_definitions')
    .select(`
      id,
      name,
      target_type,
      scope,  
      scope_id,
      metadata
    `)
    .match({ scope: 'project', scope_id: projectId })
    .then(({ error, data }) => { 
      if (error || !data) {
        return  { error, data: [] };
      } else {
        return  { 
          error, 
          data: data.map(def => ({ 
            label: def.name,
            color: def.metadata?.color
          } as VocabularyTerm))
        };
      }
    });

export const clearProjectTagVocabulary = (
  supabase: SupabaseClient,
  projectId: string
): Promise<void> => new Promise((resolve, reject) => {
  supabase
    .from('tag_definitions')
    .delete()
    .match({ scope: 'project', scope_id: projectId })
    .then(({ error }) => {
      if (error)
        reject(error);
      else 
        resolve();
    })
});

export const setProjectTagVocabulary = (
  supabase: SupabaseClient,
  projectId: string,
  terms: VocabularyTerm[]
): Promise<void> => 
  // Clear vocab first
  clearProjectTagVocabulary(supabase, projectId)
    .then(() => new Promise((resolve, reject) => {
      supabase
        .from('tag_definitions')
        .insert(terms.map(term => ({
          scope: 'project',
          scope_id: projectId,
          name: term.label,
          metadata: term.color ? {
            color: term.color
          } : {}
        })))
        .then(({ error }) => {
          if (error)
            reject(error)
          else
            resolve();
        })
    }));

export const getTagDefinitions = (
  supabase: SupabaseClient,
  scope: string,
  scopeId: string,
  targetType?: string,
  order: {
    column: string,
    ascending?: boolean
  } = { column: 'created_at', ascending: false }
): Response<TagDefinition[]> =>
  supabase
    .from('tag_definitions')
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
    .match({
      scope: scope,
      scope_id: scopeId,
      target_type: targetType
    })
    .order(order.column, { ascending: order.ascending })
    .then(({ error, data }) => {
      if (error || !data) {
        return  { error, data: [] };
      } else {
        return { data };
      }
    })

export const createTagsForTagDefinitions = (
  supabase: SupabaseClient,
  tagDefinitionIds: string[],
  scopeType: string,
  scopeId: string,
  targetType: string,
  targetId: string
) =>
  new Promise((resolve, reject) => (
    supabase
      .rpc('create_tags_for_tag_definitions_rpc', {
        _tag_definition_ids: tagDefinitionIds,
        _scope: scopeType,
        _scope_id: scopeId,
        _target_type: targetType,
        _target_id: targetId
      })
      .then(({ error, data }) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      })
  ));

export const createTagsForTargets = (
  supabase: SupabaseClient,
  tagDefinitionId: string,
  targetIds: string[]
) =>
  new Promise((resolve, reject) => (
    supabase
      .rpc('create_tags_for_targets_rpc', {
        _tag_definition_id: tagDefinitionId,
        _target_ids: targetIds
      })
      .then(({ error, data }) => {
        if (error) {
          reject(error);
        } else {
          resolve(data);
        }
      })
  ));