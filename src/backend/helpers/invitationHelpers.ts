import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExtendedProjectData, Invitation } from 'src/Types';
import { getProjectExtended } from './projectHelpers';

export const joinProject = (
  supabase: SupabaseClient,
  invitation: Invitation
): Promise<ExtendedProjectData> =>
  new Promise((resolve, reject) => {
    supabase
      .rpc('process_invite', { _invite_id: invitation.id, _option: 'accept' })
      .then(({ error }) => {
        if (error) {
          reject(error);
        } else {
          getProjectExtended(supabase, invitation.project_id).then(
            ({ error, data }) => {
              if (error || !data) reject(error);
              else resolve(data);
            }
          );
        }
      });
  });

/**
 * This method joins a project without retrieving follow-up project data.
 * We only use this to silently "discard" invitations for project we are
 * already a member of.
 */
export const silentlyJoinProject = (
  supabase: SupabaseClient,
  invitation: Invitation
): Promise<void> =>
  new Promise((resolve, reject) => {
    supabase
      .rpc('process_invite', { _invite_id: invitation.id, _option: 'accept' })
      .then(({ error }) => {
        if (error) reject(error);
        else resolve();
      });
  });

export const declineInvitation = (
  supabase: SupabaseClient,
  invitation: Invitation
) =>
  supabase
    .rpc('process_invite', { _invite_id: invitation.id, _option: 'ignore' })
    .then(({ error, data }) => ({ error, data }));
