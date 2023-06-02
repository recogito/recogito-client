import type { SupabaseClient } from '@supabase/supabase-js';
import type { UserProfile } from 'src/Types';

export const getUser = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.role !== "authenticated")
    return undefined;

  return user;
}

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

export const isLoggedIn = async (supabase: SupabaseClient) =>
  await getUser(supabase) != null;