import type { SupabaseClient, User } from '@supabase/supabase-js';

export const getUser = (supabase: SupabaseClient): Promise<User> =>
  supabase.auth.getSession().then(({ error, data }) => {
    if (error || !data?.session) {
      throw error || 'Unauthorized';
    } else {
      return supabase.auth.getUser().then(({ error, data }) => {
        if (error) {
          throw error;
        } else if (!data.user) {
          throw 'Unauthorized';
        } else if (data.user.role !== 'authenticated') {
          throw 'Unauthorized';
        } else {
          return data.user;
        }
      });
    }
  });

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then((user) => Boolean(user))
    .catch(() => false);
