import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';
import { getMyProfile } from '@backend/crud';
import nodemailer from 'nodemailer';
import { getTranslations } from '@i18n';
import {
  type TReaderDocument,
  renderToStaticMarkup,
} from '@usewaypoint/email-builder';

export type ApiPostInviteUserToProject = {
  email: string;
  projectId: string;
  projectName: string;
  projectGroupId: string;
  invitedBy: string;
};

export const POST: APIRoute = async ({ request, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(cookies);

  const me = await getMyProfile(supabase);

  if (me.error || !me.data)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });

  const body: ApiPostInviteUserToProject = await request.json();

  // Create the invite
  const inviteResponse = await supabase
    .from('invites')
    .insert({
      email: body.email.toLowerCase(),
      project_id: body.projectId,
      project_name: body.projectName,
      project_group_id: body.projectGroupId,
      invited_by_name: body.invitedBy,
    })
    .select()
    .single();

  if (inviteResponse.error) {
    return new Response(JSON.stringify({ error: 'Failed to invite user' }), {
      status: 500,
    });
  }

  const i18n = getTranslations(request, 'email');
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
          url: `${url.protocol}//${url.host}/img/branding/email/top-logo.svg`,
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
          text: t['Hello Recogito Studio User'],
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
          text: `${body.invitedBy} ${t['has invited you to join the']} ${body.projectName} ${t['project on']} ${url.host}. ${t['Use the button below to accept the invitation, or accept the invitation from the Notifications button next time you log in.']}`,
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
          text: 'Open dashboard',
          url: `${url.protocol}//${url.host}/${lang}/projects/${body.projectId}/accept-invite`,
        },
      },
    },
  };

  console.log(
    `${url.host}/${lang}/projects/${body.projectId}?accept-invite=true`
  );

  const html = renderToStaticMarkup(config, { rootBlockId: 'root' });

  const transporter = nodemailer.createTransport({
    // @ts-ignore
    host: import.meta.env.MAIL_HOST,
    port: import.meta.env.MAIL_PORT,
    tls: true,
    auth: {
      user: import.meta.env.MAIL_USERNAME,
      pass: import.meta.env.MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: import.meta.env.MAIL_FROM_ADDRESS,
    to: body.email.toLowerCase(),
    subject: t['_you_have_been_invited_'],
    html: html,
  };

  const sendResp = await transporter.sendMail(mailOptions);

  console.log('Message sent: ', sendResp.messageId);

  return new Response(
    JSON.stringify({ error: null, data: inviteResponse.data }),
    { status: 200 }
  );
};
