import type { SupabaseClient } from '@supabase/supabase-js';

export const getAnnotations = (
  supabase: SupabaseClient,
  layerIds: string | string[]
) => {
  const query = supabase
    .from('annotations')
    .select(`
      id,
      layer_id,
      is_private,
      targets ( 
        annotation_id,
        created_at,
        created_by:profiles!targets_created_by_fkey(
          id,
          nickname,
          avatar_url
        ),
        updated_at,
        updated_by:profiles!targets_updated_by_fkey(
          id,
          nickname,
          avatar_url
        ),
        version,
        value
      ),
      bodies ( 
        id,
        annotation_id,
        created_at,
        created_by:profiles!bodies_created_by_fkey(
          id,
          nickname,
          avatar_url
        ),
        updated_at,
        updated_by:profiles!bodies_updated_by_fkey(
          id,
          nickname,
          avatar_url
        ),
        version,
        purpose,
        value
      )
    `);

    return Array.isArray(layerIds) ?
      query.in('layer_id', layerIds) :
      query.eq('layer_id', layerIds);
  }