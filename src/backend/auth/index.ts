import type { SupabaseClient, User } from '@supabase/supabase-js';

export const getUser = (supabase: SupabaseClient): Promise<User> => {
  console.log('calling supabase.auth.getUser()');
  return supabase.auth.getUser().then(({ error, data: { user } }) => {
    if (error) {
      console.error('error getting user');
      console.error(error);
      throw error;
    } else if (user === null) {
      console.error('No error, but could not get user object');
      throw 'Unauthorized';
    } else if (user.role !== 'authenticated') {
      console.error('User not authenticated', user);
      throw 'Unauthorized';
    } else {
      console.log('success', user);
      return user;
    }
  });
}

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then(user => Boolean(user))
    .catch(() => false);