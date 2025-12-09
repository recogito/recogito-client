import { createSupabaseServerClient } from '@backend/supabaseServerClient.ts';
import { configure, tasks } from '@trigger.dev/sdk';
import type { runJob } from '@trigger/runJob';
import type { APIRoute } from 'astro';

configure({
  secretKey:
    process?.env.TRIGGER_SECRET_KEY || import.meta.env.TRIGGER_SECRET_KEY,
  baseURL:
    process?.env.TRIGGER_SERVER_URL || import.meta.env.TRIGGER_SERVER_URL,
});

export const POST: APIRoute = async ({ cookies, request }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(request, cookies);
  if (!supabase) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // User must be an Org Admin to use this endpoint

  // Get the user
  const userResp = await supabase.auth.getUser();

  if (userResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to get user' }), { status: 500 });
  }

  const user = userResp.data;
  const id = user.user.id;

  // Is the user an Org Admin?
  const orgAdminResp = await supabase.rpc('is_admin_organization', { user_id: id });

  if (orgAdminResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to get org admin response' }), { status: 500 });
  }

  if (!orgAdminResp.data) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const { jobId, ...rest } = await request.json();

  const sessionResp = await supabase.auth.getSession();

  if (sessionResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to get session' }), { status: 500 });
  }

  if (!sessionResp.data) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const token = sessionResp.data.session?.access_token || '';
  const handle = await tasks.trigger<typeof runJob>('run-job', { jobId, token, ...rest });

  if (handle) {
    return new Response(
      JSON.stringify({
        message: `Job is running with handle: ${handle.id}`,
      }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  } else {
    return new Response(
      JSON.stringify({
        message: `Failed to execute job`,
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
  }
};