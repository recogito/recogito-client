import type { SupabaseClient } from '@supabase/supabase-js';
import type { Invitation, MyProfile, Notification } from 'src/Types';
import type { Response } from '@backend/Types';

export const listMyInvites = (
  supabase: SupabaseClient,
  user: MyProfile
): Response<Invitation[]> =>
  supabase
    .from('invites')
    .select(
      `
        id,
        ignored,
        created_at,
        invited_by_name,
        project_name,
        project_id
      `
    )
    .is('accepted', false)
    .eq('email', user.email?.toLowerCase())
    .then(({ error, data }) => ({ error, data: data as Invitation[] }));

export const listMyNotifications = (
  supabase: SupabaseClient,
  user: MyProfile
): Response<Notification[]> =>
  supabase
    .from('notifications')
    .select(
      ` 
          id,
          created_at,
          target_user_id,
          message,
          action_url,
          action_message,
          message_type,
          is_acknowledged
      `
    )
    .eq('target_user_id', user.id)
    .is('is_acknowledged', false)
    .then(({ error, data }) => ({ error, data: data as Notification[] }));

export const processAcceptInvite = (supabase: SupabaseClient, id: string) =>
  supabase
    .from('invites')
    .update({ accepted: true })
    .eq('id', id)
    .then(({ error, data }) => {
      if (error)
        console.log(error);
      
      return { error, data };
    });

export const processIgnoreInvite = (supabase: SupabaseClient, id: string) =>
  supabase
    .from('invites')
    .update({ ignored: true })
    .eq('id', id)
    .then(({ error, data }) => ({ error, data }));

export const processUnignoreInvite = (supabase: SupabaseClient, id: string) =>
  supabase
    .from('invites')
    .update({ ignored: false })
    .eq('id', id)
    .then(({ error, data }) => ({ error, data }));
