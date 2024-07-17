import type { SupabaseClient, User } from '@supabase/supabase-js';

export const getUser = (supabase: SupabaseClient): Promise<User> => {
  console.log('calling supabase.auth.getSession()');

  return supabase.auth.getSession().then(({ error }) => {
    if (error) {
      console.error('error getting session');
      console.error(error);
      throw error;
    } else {
      console.log('calling supabase.auth.getUser()');

      return supabase.auth.getUser().then(({ error, data }) => {
        if (error) {
          console.error('error getting user');
          console.error(error);
          throw error;
        } else if (!data.user) {
          console.error('No error, but could not get session object');
          throw 'Unauthorized';
        } else if (data.user.role !== 'authenticated') {
          console.error('User not authenticated', data.user);
          throw 'Unauthorized';
        } else {
          return data.user;
        }
      });
    }
  });
}

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then(user => Boolean(user))
    .catch(() => false);