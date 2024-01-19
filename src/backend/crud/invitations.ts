import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Invitation } from 'src/Types';

export const deleteInvitation = (
  supabase: SupabaseClient,
  invitation: Invitation
): Response<boolean> =>
  supabase
    .rpc('delete_invite', {
      _invite_id: invitation.id,
    })
    .then(({ error, data }) => ({ error, data: data as boolean }));
