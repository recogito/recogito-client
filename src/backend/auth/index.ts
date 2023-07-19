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

export const getUserProfile = async (supabase: SupabaseClient) => {
  const user = await getUser(supabase);
  if (!user)
    return undefined;

  return supabase
    .from('profiles')
    .select(`
      id,
      nickname,
      avatar_url
    `)
    .eq('id', user.id)
    .single()
    .then(({ error, data }) => { 
      // Can never happen, unless there's a DB integrity issue!
      if (error)
        throw `Fatal: user ${user.id} has no profile`;

      return data as UserProfile;
    });  
}

export const isLoggedIn = (supabase: SupabaseClient) =>
  getUser(supabase)
    .then(user => Boolean(user))
    .catch(() => false);