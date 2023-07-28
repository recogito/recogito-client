import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExtendedProjectData, Invitation } from 'src/Types';
import { getProjectExtended } from './projectHelpers';

export const joinProject = (
  supabase: SupabaseClient, 
  invitation: Invitation
): Promise<ExtendedProjectData> => new Promise((resolve, reject) => {
  supabase
    .from('invites')
    .update({ accepted: true })
    .eq('id', invitation.id)
    .then(({ error }) => {
      if (error) {
        reject(error);
      } else {
        getProjectExtended(supabase, invitation.project_id)
          .then(({ error, data }) => {
            if (error || !data)
              reject(error);
            else 
              resolve(data);
          });
      }
    });
});

export const declineInvitation = (supabase: SupabaseClient, invitation: Invitation) =>
  supabase
    .from('invites')
    .update({ ignored: true })
    .eq('id', invitation.id)
    .then(({ error, data }) => ({ error, data }));