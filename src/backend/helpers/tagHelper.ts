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
