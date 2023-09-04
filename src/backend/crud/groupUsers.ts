import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { GroupMember } from 'src/Types';

export const getGroupMembers = (
  supabase: SupabaseClient, 
  groupIds: string[]
): Response<GroupMember[]> =>
  supabase
    .from('group_users')
    .select(`
      user:profiles!group_users_user_id_fkey (
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      ),
      in_group:type_id,
      since:created_at
    `)
    .in('type_id', groupIds)
    .then(({ error, data }) => ({ error, data: data as unknown as GroupMember[] }));

interface EmptyGroup {

  id: string;

  name: string;

}

// Takes the given group and member lists as input, and 'distributes'
// members across groups, resulting in a list of proper Group object.
export const zipMembers = (groups: EmptyGroup[], members: GroupMember[]) =>
  groups.map(g => ({
    ...g,
    members: members
      .filter(m => m.in_group === g.id)
      .map(({ user, since }) => ({ user, since }))
  }))