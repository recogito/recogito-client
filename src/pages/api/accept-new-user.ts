import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import { decrypt } from '@backend/crypto';
import type { ApiAcceptOrgInvite } from '../../Types';
import { error } from 'node_modules/astro/dist/core/logger/core';

const INVITE_CRYPTO_KEY =
  process.env.INVITE_CRYPTO_KEY || import.meta.env.INVITE_CRYPTO_KEY;

const supabaseServerUrl =
  import.meta.env.SUPABASE_SERVERCLIENT_URL || import.meta.env.PUBLIC_SUPABASE;

const invitesAllowed = import.meta.env.PUBLIC_ENABLE_USER_INVITE;

export const POST: APIRoute = async ({ request, url, redirect }) => {
  // Should this be callable at all?
  if (!invitesAllowed) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  const data: ApiAcceptOrgInvite = await request.json();

  // Verify the token
  const key = Buffer.from(INVITE_CRYPTO_KEY, 'base64');
  const token = data.token;

  if (!token) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Decrypt the token
  const values = decrypt(token, key);
  const check = values.split('|');

  // Get the user
  const supa = await createClient(
    supabaseServerUrl,
    import.meta.env.SUPABASE_SERVICE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const getUserResp = await supa.auth.admin.getUserById(check[0]);
  if (getUserResp.error) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });
  }

  // Verify email
  if (getUserResp.data.user.email !== data.email) {
    return new Response(JSON.stringify({ error: 'Email not authorized' }), {
      status: 404,
    });
  }

  // Verify time
  const sent = new Date(check[1]);
  const diffInMs = Date.now() - sent.getTime();

  if (diffInMs > 8.64e7) {
    return new Response(JSON.stringify({ error: 'Token Expired' }), {
      status: 404,
    });
  }

  // Update the user
  const updateUserResp = await supa.auth.admin.updateUserById(
    getUserResp.data.user.id,
    { password: data.password, email_confirm: true }
  );

  if (updateUserResp.error) {
    console.log(error);
    return new Response(JSON.stringify({ error: 'Failed to update user' }), {
      status: 500,
    });
  }

  return redirect('/sign-out');
};
