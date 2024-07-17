import type { SupabaseClient, User } from '@supabase/supabase-js';

export const getUser = (supabase: SupabaseClient): Promise<User> =>
  supabase.auth.getSession().then(({ error, data }) => {
    if (error) {
      console.error('error getting session');
      console.error(error);
      throw error;
    } else if (!data?.session) {
      console.error('No error, but could not get session object');
      throw 'Unauthorized';
    } else {
      const { user } = data.session;
      if (!user || user.role !== 'authenticated') {
        console.error('User not authenticated', user);
        throw 'Unauthorized';
      } else {
        return user;
      }
    }
  });

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then(user => Boolean(user))
    .catch(() => false);