import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExtendedUserProfile } from 'src/Types';

export const changeOrgGroupMembership = async (
  supabase: SupabaseClient,
  user: ExtendedUserProfile,
  newGroupId: string
) => {
  const resp = await supabase.rpc('change_org_group_membership', {
    _user_id: user.id,
    _new_group_id: newGroupId,
  });

  if (resp.error) {
    return false;
  }

  return resp.data;
};
