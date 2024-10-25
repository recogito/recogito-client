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

