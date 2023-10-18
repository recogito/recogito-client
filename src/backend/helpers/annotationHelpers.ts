import type { SupabaseClient } from '@supabase/supabase-js';
import { Visibility } from '@recogito/annotorious-supabase';
import type { SupabaseAnnotation, SupabaseAnnotationTarget, SupabaseAnnotationBody } from '@recogito/annotorious-supabase';
import type { Response } from '@backend/Types';

export const getAnnotations = (
  supabase: SupabaseClient,
  layerIds: string | string[]
): Response<SupabaseAnnotation[]> => {
  const query = supabase
    .from('annotations')
    .select(`
      id,
      created_at,
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

    return (
      Array.isArray(layerIds) ?
        query.in('layer_id', layerIds) :
        query.eq('layer_id', layerIds)
    ).then(({ error, data }) => {
      if (error) {
        return ({ error, data: undefined as unknown as SupabaseAnnotation[] })
      } else {
        const crosswalkBody = ({ 
          // @ts-ignore
          id, annotation_id, created_at, updated_at, version, purpose, value, created_by, updated_by 
        }): SupabaseAnnotationBody => ({
          id,
          annotation: annotation_id,
          purpose, 
          value,
          version
        })
        
        const crosswalkTarget = ({ 
          // @ts-ignore
          annotation_id, created_at, updated_at, value, updated_by 
        }): SupabaseAnnotationTarget => ({
          annotation: annotation_id,
          selector: JSON.parse(value)
        })

        return ({
          error,
          data: data.map(({ targets, created_at, is_private, bodies, ...annotation }) => ({
            ...annotation,
            target: crosswalkTarget(targets[0]),
            bodies: bodies.map(crosswalkBody),
            visibility: is_private ? Visibility.PRIVATE : undefined
          } as unknown as SupabaseAnnotation))
        })
      }
    })
  }