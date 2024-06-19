import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { GroupMember } from 'src/Types';

export const getProjectGroupMembers = (
  supabase: SupabaseClient,
  groupIds: string[]
): Response<GroupMember[]> =>
  supabase
    .from('group_users')
    .select(
      `
      user:profiles!group_users_user_id_fkey (
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      ),
      in_group:type_id,
      since:created_at
    `
    )
    .in('type_id', groupIds)
    .eq('group_type', 'project')
    .then(({ error, data }) => ({
      error,
      data: data as unknown as GroupMember[],
    }));
