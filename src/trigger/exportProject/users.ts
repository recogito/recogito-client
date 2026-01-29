import type { SupabaseClient } from '@supabase/supabase-js';

interface ProjectUsers {
  user_id: string;
}

const getUserIds = async (
  supabase: SupabaseClient,
  projectId: string
): Promise<string[]> =>
  supabase
    .rpc('get_project_users_rpc', { _project_id: projectId })
    .then(({ data }) => ({ data: data as ProjectUsers[] }))
    .then(({ data }) => data?.map(({ user_id: userId }) => userId))

export const exportProfiles = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const userIds = await getUserIds(supabase, projectId);

  return supabase
    .from('profiles')
    .select()
    .in('id', userIds);
};