import type { SupabaseClient } from '@supabase/supabase-js';

// fetch the current access token instead of relying
// on the one from the initial request
export const getAccessToken = async (supabase: SupabaseClient): Promise<string> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw error;
  }

  const token = data.session?.access_token;

  if (!token) {
    // Shouldn't really happen at this point
    throw new Error('Not authorized');
  }

  return token;
};
