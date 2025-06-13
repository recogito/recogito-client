import { SupabaseClient } from '@supabase/supabase-js';

export const acknowledgeNotification = (
  supabase: SupabaseClient,
  notificationId: string
): PromiseLike<boolean> =>
  supabase
    .from('notifications')
    .update({ is_acknowledged: true })
    .eq('notification_id', notificationId)
    .then(({ error, data }) => {
      if (error) {
        return false;
      }

      return true;
    });
