import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';

const supabaseServerUrl =
  import.meta.env.SUPABASE_SERVERCLIENT_URL || import.meta.env.PUBLIC_SUPABASE;

const invitesAllowed = import.meta.env.PUBLIC_ENABLE_USER_INVITE;

export const POST: APIRoute = async ({ request, cookies }) => {
  console.log('Checking for allowed imports');
  // Should this be callable at all?
  if (!invitesAllowed) {
    console.log('Invites not allowed!');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Verify if the user is logged in
  console.log('verify login');
  const supabase = await createSupabaseServerClient(cookies);
  if (!supabase) {
    console.log('Failed to create client!');
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // User must be an Org Admin to use this endpoint

  // Get the user
  console.log('Get User');
  const userResp = await supabase.auth.getUser();

  if (userResp.error) {
    console.log('Get User failed!');
    return new Response(JSON.stringify({ error: 'Failed to get user' }), {
      status: 500,
    });
  }

  const user = userResp.data;

  const id = user.user.id;

  // Is the user an Org Admin?
  console.log('Checking Is org admin');
  const orgAdminResp = await supabase.rpc('is_admin_organization', {
    user_id: id,
  });

  if (orgAdminResp.error) {
    console.log('org admin check failed: ', orgAdminResp.error);
    return new Response(
      JSON.stringify({ error: 'Failed to get org admin response' }),
      {
        status: 500,
      }
    );
  }

  if (!orgAdminResp.data) {
    console.log('');
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

  console.log('Email: ', body.email);
  const inviteResp = await supa.auth.admin.inviteUserByEmail(body.email);

  if (inviteResp.error) {
    console.log('Invite error: ', inviteResp.error);
    return new Response(JSON.stringify({ error: 'Failed to invite user' }), {
      status: 500,
    });
  }

  return new Response(null, { status: 204 });
};
