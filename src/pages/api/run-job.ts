import { createSupabaseServerClient } from '@backend/supabaseServerClient.ts';
import { configure, tasks } from '@trigger.dev/sdk';
import type { runJob } from '@trigger/runJob';
import type { APIRoute } from 'astro';

interface EnvVars {
  publicSupabaseUrl: string;
  publicSupabaseApiKey: string;
  iiifProjectId: string;
  iiifUrl: string;
  vaultTenantPath?: string;
}

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
      { status: 500 }
    );
  }

  if (!orgAdminResp.data) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const { jobId, ...rest } = await request.json();

  const sessionResp = await supabase.auth.getSession();

  if (sessionResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to get session' }), {
      status: 500,
    });
  }

  if (!sessionResp.data) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const token = sessionResp.data.session?.access_token || '';

  // pass non-secret, tenant-specific environment variables to trigger
  const envVars: EnvVars = {
    publicSupabaseUrl:
      process?.env.SUPABASE_SERVERCLIENT_URL ||
      import.meta.env.SUPABASE_SERVERCLIENT_URL ||
      process?.env.PUBLIC_SUPABASE ||
      import.meta.env.PUBLIC_SUPABASE,
    publicSupabaseApiKey:
      process?.env.PUBLIC_SUPABASE_API_KEY ||
      import.meta.env.PUBLIC_SUPABASE_API_KEY,
    iiifProjectId:
      process?.env.IIIF_PROJECT_ID || import.meta.env.IIIF_PROJECT_ID,
    iiifUrl: process?.env.IIIF_URL || import.meta.env.IIIF_URL,
  };

  // if multi-tenant, pass tenant path (1pw vault name + item name)
  const OP_VAULT_NAME =
    process?.env.OP_VAULT_NAME || import.meta.env.OP_VAULT_NAME;
  const OP_ITEM_NAME =
    process?.env.OP_ITEM_NAME || import.meta.env.OP_ITEM_NAME;

  if (OP_VAULT_NAME && OP_ITEM_NAME) {
    envVars['vaultTenantPath'] = `${OP_VAULT_NAME}/${OP_ITEM_NAME}`;
  }

  const handle = await tasks.trigger<typeof runJob>('run-job', {
    jobId,
    token,
    ...envVars,
    ...rest,
  });

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
