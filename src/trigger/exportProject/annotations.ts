import type { SupabaseClient } from '@supabase/supabase-js';
import { getLayerIds } from '@trigger/exportProject/layers.ts';

export const exportAnnotations = async  (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  return supabase
    .from('annotations')
    .select()
    .in('layer_id', layerIds);
};

export const exportBodies = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  return supabase
    .from('bodies')
    .select()
    .in('layer_id', layerIds);
};

export const exportTargets = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  return supabase
    .from('targets')
    .select()
    .in('layer_id', layerIds);
};
