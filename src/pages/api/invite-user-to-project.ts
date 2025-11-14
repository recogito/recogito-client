import { createElement } from 'react';
import { createSupabaseServerClient } from '@backend/supabaseServerClient';
import type { APIRoute } from 'astro';
import { getMyProfile } from '@backend/crud';
import nodemailer from 'nodemailer';
import { i18n } from 'astro:config/server';
import { render } from '@react-email/render';
import { InviteUserEmail } from '@components/InviteUserEmail';
import type { ApiPostInviteUserToProject } from 'src/Types';
import { getFixedT } from 'src/i18n/server';

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
  const supabase = await createSupabaseServerClient(request, cookies);

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

    const lang = i18n?.defaultLocale || 'en';
    const t = await getFixedT(lang, ['email']);

    const acceptInviteUrl = `${url.protocol}//${url.host}/${lang}/projects/${body.projectId}/accept-invite`;

    const html = await render(
      createElement(InviteUserEmail, {
        acceptInviteLabel: t('Open dashboard', { ns: 'email' }),
        acceptInviteUrl,
        helloMessage: t('Hello Recogito Studio User', { ns: 'email' }),
        host: url.host,
        welcomeMessage: t('_welcome_message_', { ns: 'email' })
          .replace('${sender}', body.invitedBy)
          .replace('${project_name}', body.projectName)
          .replace('${host}', url.host),
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
      to: user.email.toLowerCase(),
      subject: t('_you_have_been_invited_', { ns: 'email' }),
      html: html,
    };

    const sendResp = await transporter.sendMail(mailOptions);

    console.log('Message sent: ', sendResp.messageId);
  }

  return new Response(JSON.stringify({ error: null, data: respData }), {
    status: 200,
  });
};
