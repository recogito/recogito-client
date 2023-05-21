import type { SupabaseClient } from '@supabase/supabase-js';

export const getUser = async (supabase: SupabaseClient) => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user || user.role !== "authenticated")
    return null;

  return user;
}

export const isLoggedIn = async (supabase: SupabaseClient) =>
  await getUser(supabase) != null;

export const signOut = async (supabase: SupabaseClient) => { 
  await supabase.auth.signOut();
  window.location.href = '/';
}