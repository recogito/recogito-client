import type { SupabaseClient } from '@supabase/supabase-js';
import { getLayerIds } from '@trigger/exportProject/layers.ts';

const getAnnotationIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  const { data: annotations } = await supabase
    .from('annotations')
    .select('id')
    .in('layer_id', layerIds);

  return annotations?.map((annotation) => annotation.id) || [];
}

export const exportAnnotations = async  (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  return supabase
    .from('annotations')
    .select()
    .in('layer_id', layerIds)
    .csv();
};

export const exportBodies = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const annotationIds = await getAnnotationIds(supabase, projectId);

  return supabase
    .from('bodies')
    .select()
    .in('annotation_id', annotationIds)
    .csv();
};

export const exportTargets = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const annotationIds = await getAnnotationIds(supabase, projectId);

  return supabase
    .from('targets')
    .select()
    .in('annotation_id', annotationIds)
    .csv();
};