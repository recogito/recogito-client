import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';
import { getMyProfile } from '@backend/crud';
import nodemailer from 'nodemailer';
import { getTranslations } from '@i18n';
import {
  type TReaderDocument,
  renderToStaticMarkup,
} from '@usewaypoint/email-builder';
import type { ApiPostInviteUserToProject } from 'src/Types';

const MAIL_HOST = process.env.MAIL_HOST || import.meta.env.MAIL_HOST;
const MAIL_PORT = process.env.MAIL_PORT || import.meta.env.MAIL_PORT;
const MAIL_USERNAME =
  process.env.MAIL_USERNAME || import.meta.env.MAIL_USERNAME;
const MAIL_PASSWORD =
  process.env.MAIL_PASSWORD || import.meta.env.MAIL_PASSWORD;
const MAIL_FROM_ADDRESS =
  process.env.MAIL_FROM_ADDRESS || import.meta.env.MAIL_FROM_ADDRESS;

export const POST: APIRoute = async ({ request, cookies, url }) => {
  // Verify if the user is logged in
  const supabase = await createSupabaseServerClient(cookies);

  console.log('Host: ', MAIL_HOST);

  const me = await getMyProfile(supabase);

  if (me.error || !me.data)
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
    });

  const body: ApiPostInviteUserToProject = await request.json();

  const respData = [];
  // Create the invites
  for (let i = 0; i < body.users.length; i++) {
    const user = body.users[i];
    const inviteResponse = await supabase
      .from('invites')
      .insert({
        email: user.email.toLowerCase(),
        project_id: body.projectId,
        project_name: body.projectName,
        project_group_id: user.projectGroupId,
        invited_by_name: body.invitedBy,
      })
      .select()
      .single();

    if (inviteResponse.error) {
      return new Response(JSON.stringify({ error: 'Failed to invite user' }), {
        status: 500,
      });
    }

    respData.push(inviteResponse.data);

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
            text: t['_welcome_message_']
              .replace('${sender}', body.invitedBy)
              .replace('${project_name}', body.projectName)
              .replace('${host}', url.host),
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
      to: user.email.toLowerCase(),
      subject: t['_you_have_been_invited_'],
      html: html,
    };

    const sendResp = await transporter.sendMail(mailOptions);

    console.log('Message sent: ', sendResp.messageId);
  }

  return new Response(JSON.stringify({ error: null, data: respData }), {
    status: 200,
  });
};
