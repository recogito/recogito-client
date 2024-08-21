import type { Invitation, Translations } from 'src/Types';
import { joinProject } from '@backend/helpers/invitationHelpers';
import { supabase } from '@backend/supabaseBrowserClient';

import './AcceptInvite.css';

interface AcceptInviteProps {
  invitation: Invitation;

  i18n: Translations;
}

export const AcceptInvite = (props: AcceptInviteProps) => {
  const { t } = props.i18n;

  const handleAccept = () => {
    joinProject(supabase, props.invitation).then((resp) => {
      if (resp) {
        const url = new URLSearchParams(window.location.search);
        const redirectUrl = url.get('redirect-to');
        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          window.location.href = `/${props.i18n.lang}/projects/${props.invitation.project_id}`;
        }
      } else {
        window.location.href = `/${props.i18n.lang}/projects`;
      }
    });
  };

  return (
    <div className='accept-invite-root'>
      <div className='accept-invite-title'>
        {`${t['Accept invitation to']}: ${['Project']} ${
          props.invitation.project_name
        }?`}
      </div>

      <div className='accept-invite-description'>
        {`${t['You have been invited to this project by']} ${props.invitation.invited_by_name}`}
      </div>

      <div className='accept-invite-button-container'>
        <button
          className='accept-invite-dialog-button-cancel'
          onClick={() =>
            (window.location.href = `/${props.i18n.lang}/projects`)
          }
        >
          {t['Cancel']}
        </button>
        <button
          className='accept-invite-dialog-button-join'
          onClick={handleAccept}
        >
          {t['Accept']}
        </button>
      </div>
    </div>
  );
};
