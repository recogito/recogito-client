import { useState } from 'react';
import type { Invitation } from 'src/Types';
import { joinProject } from '@backend/helpers/invitationHelpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { createClientI18n, type PreloadedI18nProps } from 'src/i18n/client';

import './AcceptInvite.css';

interface AcceptInviteProps {
  invitation: Invitation;
}

const AcceptInvite = (props: AcceptInviteProps) => {
  const { t, i18n } = useTranslation(['dashboard-projects', 'project-collaboration']);

  const handleAccept = () => {
    joinProject(supabase, props.invitation).then((resp) => {
      if (resp) {
        const url = new URLSearchParams(window.location.search);
        const redirectUrl = url.get('redirect-to');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = `/${i18n.language}/projects/${props.invitation.project_id}`;
        }
      } else {
        window.location.href = `/${i18n.language}/projects`;
      }
    });
  };

  return (
    <main className='accept-invite-root' id='main'>
      <div className='accept-invite-title'>
        {t('acceptInvitationHeader', {
          projectName: props.invitation.project_name,
          ns: 'dashboard-projects',
        })}
      </div>

      <div className='accept-invite-description'>
        {t('invitedBy', {
          invitedByName: props.invitation.invited_by_name,
          ns: 'dashboard-projects',
        })}
      </div>

      <div className='accept-invite-button-container'>
        <button
          className='accept-invite-dialog-button-cancel'
          onClick={() => (window.location.href = `/${i18n.language}/projects`)}
        >
          {t('Cancel', { ns: 'project-collaboration' })}
        </button>
        <button
          className='accept-invite-dialog-button-join'
          onClick={handleAccept}
        >
          {t('Accept', { ns: 'project-collaboration' })}
        </button>
      </div>
    </main>
  );
};

export const AcceptInviteApp = (
  { lng, resources, ...props }: AcceptInviteProps & PreloadedI18nProps
) => {
  const [i18n] = useState(() => createClientI18n(lng, resources));

  return (
    <I18nextProvider i18n={i18n}>
      <AcceptInvite {...props} />
    </I18nextProvider>
  );
};
