import type { SupabaseClient, User } from '@supabase/supabase-js';
import type { UserProfile } from 'src/Types';

export const getUser = (supabase: SupabaseClient): Promise<User> =>
  supabase.auth.getUser().then(({ error, data: { user } }) => {
    if (error) {
      throw error;
    } else if (user === null) {
      throw 'Unauthorized';
    } else if (user.role !== 'authenticated') {
      throw 'Unauthorized';
    } else {
      return user;
    }
  });

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then(user => Boolean(user))
    .catch(() => false);