import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

const supabaseServerUrl =
  import.meta.env.SUPABASE_SERVERCLIENT_URL || import.meta.env.PUBLIC_SUPABASE;

const invitesAllowed = import.meta.env.PUBLIC_ENABLE_USER_INVITE;

export const post: APIRoute = async ({ request, cookies }) => {
  // Should this be callable at all?
  if (!invitesAllowed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // User must be an Org Admin to use this endpoint

  // Get the user
  const userResp = await supabase.auth.getUser();

  if (userResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to get user' }), {
      status: 500,
    });
  }

  const user = userResp.data;

  const id = user.user.id;

  // Is the user an Org Admin?
  const orgAdminResp = await supabase.rpc('is_admin_organization', {
    user_id: id,
  });

  if (orgAdminResp.error) {
    return new Response(
      JSON.stringify({ error: 'Failed to get org admin response' }),
      {
        status: 500,
      }
    );
  }

  if (!orgAdminResp.data) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Org Admin, Go ahead and use the Service Key to invite
  const supa = createClient(
    supabaseServerUrl,
    import.meta.env.SUPABASE_SERVICE_KEY
  );

  const body = await request.json();

  const inviteResp = await supa.auth.admin.inviteUserByEmail(body.email);

  if (inviteResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to invite user' }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};
