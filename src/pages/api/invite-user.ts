import { createElement } from 'react';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { i18n } from 'astro:config/server';
import { render } from '@react-email/render';
import { InviteUserEmail } from '@components/InviteUserEmail';
import { encrypt } from '@backend/crypto';
import { getFixedT } from 'src/i18n/server';

const MAIL_HOST = process.env.MAIL_HOST || import.meta.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT || import.meta.env.MAIL_PORT;
const MAIL_USERNAME =
  process.env.MAIL_USERNAME || import.meta.env.MAIL_USERNAME;
const MAIL_PASSWORD =
  process.env.MAIL_PASSWORD || import.meta.env.MAIL_PASSWORD;
const MAIL_FROM_ADDRESS =
  process.env.MAIL_FROM_ADDRESS || import.meta.env.MAIL_FROM_ADDRESS;

const INVITE_CRYPTO_KEY =
  process.env.INVITE_CRYPTO_KEY || import.meta.env.INVITE_CRYPTO_KEY;

const supabaseServerUrl =
  import.meta.env.SUPABASE_SERVERCLIENT_URL || import.meta.env.PUBLIC_SUPABASE;

const invitesAllowed = import.meta.env.PUBLIC_ENABLE_USER_INVITE;

console.log('Port, host: ', MAIL_PORT, MAIL_HOST);
export const POST: APIRoute = async ({ request, cookies, url }) => {
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
  const supa = await createClient(
    supabaseServerUrl,
    import.meta.env.SUPABASE_SERVICE_KEY
  );

  const body = await request.json();

  // Create the user and then send an immediate
  const inviteResp = await supa.auth.admin.createUser({
    email: body.email,
    password: generatePassword(14),
  });

  if (inviteResp.error) {
    return new Response(JSON.stringify({ error: 'Failed to create user' }), {
      status: 500,
    });
  }

  // create a token
  const key = Buffer.from(INVITE_CRYPTO_KEY, 'base64');
  const token = encrypt(`${inviteResp.data.user.id}|${Date.now()}`, key);

    const lang = i18n?.defaultLocale || 'en';
    const t = await getFixedT(lang, ['email']);

  const acceptInviteUrl = `${url.protocol}//${url.host}/${lang}/accept-org-invite?token=${token}`;

  const html = await render(
    createElement(InviteUserEmail, {
      welcomeMessage: t('joinRecogitoMessage', { ns: 'email', instanceName: url.host }),
      host: url.host,
      helloMessage: t('Greetings', { ns: 'email' }),
      acceptInviteLabel: t('Accept Invite', { ns: 'email' }),
      acceptInviteUrl,
    })
  );

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: MAIL_HOST,
    port: MAIL_PORT,
    tls: true,
    auth: {
      user: MAIL_USERNAME,
      pass: MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: MAIL_FROM_ADDRESS,
    to: body.email.toLowerCase(),
    subject: t('Join Recogito', { ns: 'email' }),
    html: html,
  };

  const sendResp = await transporter.sendMail(mailOptions);

  console.log('Message sent: ', sendResp.messageId);

  return new Response(null, { status: 204 });
};

const generatePassword = (length: number) => {
  const chars =
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~`|}{[]:;?><,./-=';
  let password = '';

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    password += chars.charAt(randomIndex);
  }

  return password;
};
