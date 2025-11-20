import type { SupabaseClient } from '@supabase/supabase-js';

export const getLayerIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: layers } = await supabase
    .from('layers')
    .select('id')
    .eq('project_id', projectId);

  return layers?.map((layer) => layer.id) || [];
};

export const exportLayerContexts = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const layerIds = await getLayerIds(supabase, projectId);

  return supabase
    .from('layer_contexts')
    .select()
    .in('layer_id', layerIds)
    .csv();
};

export const exportLayerGroups = async (
  supabase: SupabaseClient,
  proejctId: string
) => {
  const layerIds = await getLayerIds(supabase, proejctId);

  return supabase
    .from('layer_groups')
    .select()
    .in('layer_id', layerIds)
    .csv();
};

export const exportLayers = async (
  supabase: SupabaseClient,
  projectId: string
) =>
  supabase
    .from('layers')
    .select()
    .eq('project_id', projectId)
    .csv();