import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { APIRoute } from 'astro';
import nodemailer from 'nodemailer';
import { getDefaultTranslations } from '@i18n';
import {
  type TReaderDocument,
  renderToStaticMarkup,
} from '@usewaypoint/email-builder';
import { encrypt } from '@backend/crypto';

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

  const i18n = getDefaultTranslations('email');

  // create a token
  const key = Buffer.from(INVITE_CRYPTO_KEY, 'base64');
  const token = encrypt(`${inviteResp.data.user.id}|${Date.now()}`, key);

  const { t, lang } = i18n;

  const config: TReaderDocument = {
    root: {
      type: 'EmailLayout',
      data: {
        backdropColor: '#b5c8dc',
        borderRadius: 8,
        canvasColor: '#FFFFFF',
        textColor: '#242424',
        fontFamily: 'MODERN_SANS',
        childrenIds: [
          'block-1709571212684',
          'block-1709571228545',
          'block-1709571234315',
          'block-1709571302968',
        ],
      },
    },
    'block-1709571212684': {
      type: 'Image',
      data: {
        style: {
          padding: {
            top: 24,
            bottom: 24,
            right: 24,
            left: 24,
          },
        },
        props: {
          url: `${url.protocol}//${url.host}/img/branding/email/top-logo.png`,
          alt: 'RecogitoStudio',
          linkHref: url.host,
          contentAlignment: 'middle',
        },
      },
    },
    'block-1709571228545': {
      type: 'Text',
      data: {
        style: {
          fontWeight: 'normal',
          padding: {
            top: 0,
            bottom: 16,
            right: 24,
            left: 24,
          },
        },
        props: {
          text: t['Greetings'],
        },
      },
    },
    'block-1709571234315': {
      type: 'Text',
      data: {
        style: {
          fontWeight: 'normal',
          padding: {
            top: 0,
            bottom: 16,
            right: 24,
            left: 24,
          },
        },
        props: {
          text: t['_join_recogito_message_'].replaceAll(
            '${instance_name}',
            url.host
          ),
        },
      },
    },
    'block-1709571302968': {
      type: 'Button',
      data: {
        style: {
          fontSize: 14,
          padding: {
            top: 16,
            bottom: 24,
            right: 24,
            left: 24,
          },
        },
        props: {
          buttonBackgroundColor: '#07529a',
          buttonStyle: 'rectangle',
          text: t['Accept Invite'],
          url: `${url.protocol}//${url.host}/${lang}/accept-org-invite?token=${token}`,
        },
      },
    },
  };

  const html = renderToStaticMarkup(config, { rootBlockId: 'root' });

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
    subject: t['Join Recogito'],
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
