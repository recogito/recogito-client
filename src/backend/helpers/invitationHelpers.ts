import type { SupabaseClient } from '@supabase/supabase-js';
import type { Invitation, Project } from 'src/Types';

export const joinProject = (
  supabase: SupabaseClient, 
  invitation: Invitation
): Promise<Project> => new Promise((resolve, reject) => {
  supabase
    .from('invites')
    .update({ accepted: true })
    .eq('id', invitation.id)
    .then(({ error }) => {
      if (error) {
        reject(error);
      } else {
        supabase
          .from('projects')
          .select(`
            id,
            created_at,
            updated_at,
            updated_by,
            name,
            description
          `)
          .eq('id', invitation.project_id)
          .maybeSingle()
          .then(({ error, data }) => {
            if (error || !data)
              reject(error);
            else 
              resolve(data as Project);
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