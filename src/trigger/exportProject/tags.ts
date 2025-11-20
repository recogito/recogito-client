import type { SupabaseClient } from '@supabase/supabase-js';

const getTagDefinitionIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: tags } = await supabase
    .from('tags')
    .select('tag_definition_id, target_id, tag_definitions(target_type)')
    .eq('tag_definitions.target_type', 'project')
    .eq('target_id', projectId);

  return tags?.map((tag) => tag.tag_definition_id) || [];
};

export const exportTagDefinitions = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const tagDefinitionIds = await getTagDefinitionIds(supabase, projectId);

  return supabase
    .from('tag_definitions')
    .select()
    .in('id', tagDefinitionIds)
    .csv();
};

export const exportTags = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const tagDefinitionIds = await getTagDefinitionIds(supabase, projectId);

  return supabase
    .from('tags')
    .select()
    .in('tag_definition_id', tagDefinitionIds)
    .csv();
};