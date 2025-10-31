import type { SupabaseClient } from '@supabase/supabase-js';
import { Visibility } from '@recogito/annotorious-supabase';
import type { SupabaseAnnotation, SupabaseAnnotationTarget, SupabaseAnnotationBody } from '@recogito/annotorious-supabase';
import type { Response } from '@backend/Types';
import type { User } from '@annotorious/react';

const crosswalkUser = ({ 
  // @ts-ignore
  id, nickname, first_name, last_name, avatar_url 
}): User => ({
  id,
  name: nickname 
    ? nickname 
    : first_name || last_name 
      ? [first_name, last_name].join(' ') : 'Anonymous',
  avatar: avatar_url
})

const crosswalkBody = ({ 
  // @ts-ignore
  id, annotation_id, created_by, created_at, updated_by, updated_at, version, format, purpose, value 
}): SupabaseAnnotationBody => ({
  id,
  annotation: annotation_id,
  created: created_at ? new Date(created_at) : undefined,
  creator: created_by ? crosswalkUser(created_by) : undefined,
  updated: updated_at ? new Date(updated_at) : undefined,
  updatedBy: updated_by ? crosswalkUser(updated_by) : undefined,
  format,
  purpose, 
  value,
  version
})

const crosswalkTarget = ({ 
  // @ts-ignore
  annotation_id, created_at, created_by, updated_at, updated_by, value
}): SupabaseAnnotationTarget => ({
  annotation: annotation_id,
  selector: JSON.parse(value),
  created: created_at ? new Date(created_at) : undefined,
  creator: created_by ? crosswalkUser(created_by) : undefined,
  updated: updated_at ? new Date(updated_at) : undefined,
  updatedBy: updated_by ? crosswalkUser(updated_by) : undefined
})

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
          first_name,
          last_name,
          avatar_url
        ),
        updated_at,
        updated_by:profiles!targets_updated_by_fkey(
          id,
          nickname,
          first_name,
          last_name,
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
          first_name,
          last_name,
          avatar_url
        ),
        updated_at,
        updated_by:profiles!bodies_updated_by_fkey(
          id,
          nickname,
          first_name,
          last_name,
          avatar_url
        ),
        version,
        format,
        purpose,
        value
      )
    `)
    .not('targets', 'is', null)

    return (
      Array.isArray(layerIds) ?
        query.in('layer_id', layerIds) :
        query.eq('layer_id', layerIds)
    ).then(({ error, data }) => {
      if (error) {
        return ({ error, data: undefined as unknown as SupabaseAnnotation[] })
      } else {
        return ({
          error,
          data: data.map(({ targets, created_at: _, is_private, bodies, ...annotation }) => ({
            ...annotation,
            target: crosswalkTarget(targets[0]),
            bodies: bodies.map(crosswalkBody),
            visibility: is_private ? Visibility.PRIVATE : undefined
          } as unknown as SupabaseAnnotation))
        })
      }
    })
  }