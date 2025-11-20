import type { SupabaseClient } from '@supabase/supabase-js';
import { getProjectGroupIds } from '@trigger/exportProject/groups';

const getUserIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const projectGroupIds = await getProjectGroupIds(supabase, projectId);

  const { data: groupUsers } = await supabase
    .from('group_users')
    .select('user_id')
    .in('type_id', projectGroupIds)
    .eq('group_type', 'project');

  return groupUsers?.map((groupUser) => groupUser.user_id) || [];
};

export const exportProfiles = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const userIds = await getUserIds(supabase, projectId);

  return supabase
    .from('profiles')
    .select()
    .in('id', userIds)
    .csv();
};