import type { SupabaseClient } from '@supabase/supabase-js';

export const inviteUserToOrg = (
  supabase: SupabaseClient,
  email: string
): Promise<boolean> =>
  supabase.auth.getSession().then(({ error, data }) => {
    // Get Supabase session token first
    if (error) {
      // Shouldn't really happen at this point
      console.log(error);
      return false;
    }
    const token = data.session?.access_token;
    if (!token) {
      // Shouldn't really happen at this point
      console.log('Not authorized');
      return false;
    }
    // Call the invite-user endpoint
    return fetch(`/api/invite-user`, {
      method: 'POST',
      headers: {
        // Storage proxy requires authentication
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ email }),
    }).then((resp) => {
      if (resp.ok) {
        return true;
      }
      return false;
    });
  });
