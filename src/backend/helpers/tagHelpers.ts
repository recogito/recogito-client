import type { Response } from '@backend/Types';
import { createTag, findTagDefinition } from '@backend/crud/tags';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Tag } from 'src/Types';

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

