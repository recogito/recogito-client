import type { SupabaseClient } from '@supabase/supabase-js';

export const getProjectGroupIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: projectGroups } = await supabase
    .from('project_groups')
    .select('id')
    .eq('project_id', projectId);

  return projectGroups?.map((projectGroup) => projectGroup.id) || [];
};

export const exportGroupUsers = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const projectGroupIds = await getProjectGroupIds(supabase, projectId);

  return supabase
    .from('group_users')
    .select()
    .eq('group_type', 'project')
    .in('type_id', projectGroupIds)
    .csv();
}

export const exportProjectGroups = async (
  supabase: SupabaseClient,
  projectId: string
) =>
  supabase
    .from('project_groups')
    .select()
    .eq('project_id', projectId)
    .csv();