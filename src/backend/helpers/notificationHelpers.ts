import type { SupabaseClient } from '@supabase/supabase-js';

export const acknowledgeNotification = (
  supabase: SupabaseClient,
  notificationId: string
): PromiseLike<boolean> =>
  supabase
    .from('notifications')
    .update({ is_acknowledged: true })
    .eq('id', notificationId)
    .then(({ error }) => {
      if (error) {
        return false;
      }

      return true;
    });
