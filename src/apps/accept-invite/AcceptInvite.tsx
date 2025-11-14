import type { Invitation } from 'src/Types';
import { joinProject } from '@backend/helpers/invitationHelpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

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
    <div className='accept-invite-root'>
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
        {`${t('You have been invited to this project by', { ns: 'dashboard-projects' })} ${props.invitation.invited_by_name}`}
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
    </div>
  );
};

export const AcceptInviteWrapper = (props: AcceptInviteProps) => (
  <I18nextProvider i18n={clientI18next}>
    <AcceptInvite {...props} />
  </I18nextProvider>
);
