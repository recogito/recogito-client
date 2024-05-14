import { useState } from 'react';
import { TimeAgo } from '@components/TimeAgo';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import {
  declineInvitation,
  joinProject,
} from '@backend/helpers/invitationHelpers';
import type { Invitation, ExtendedProjectData, Translations } from 'src/Types';

import './InvitationItem.css';

interface InvitationItemProps {
  i18n: Translations;

  invitation: Invitation;

  onAccepted(project: ExtendedProjectData): void;

  onDeclined(): void;

  onError(error: string): void;
}

export const InvitationItem = (props: InvitationItemProps) => {
  const { t } = props.i18n;

  const i = props.invitation;

  const [accepted, setAccepted] = useState(false);

  const [declined, setDeclined] = useState(false);

  const onAccept = () => {
    setAccepted(true);

    const minWait = new Promise((resolve) => {
      setTimeout(() => resolve(null), 1000);
    });

    const join = joinProject(supabase, i);

    Promise.all([minWait, join])
      .then(([_, project]) => {
        props.onAccepted(project);
      })
      .catch((error) => {
        props.onError(error);
      });
  };

  const onDecline = () => {
    setDeclined(true);

    const minWait = new Promise((resolve) => {
      setTimeout(() => resolve(null), 1000);
    });

    const decline = declineInvitation(supabase, i);

    Promise.all([minWait, decline]).then(([_, { error }]) => {
      if (error) props.onError(error.message);
      else props.onDeclined();
    });
  };

  return (
    <li className='notification-item invitation-item'>
      <p
        dangerouslySetInnerHTML={{
          __html: t['Invitation']
            .replace('${sender}', i.invited_by_name as string)
            .replace('${project}', i.project_name as string),
        }}
      />

      <TimeAgo datetime={i.created_at} locale={props.i18n.lang} />

      <div className='invitation-actions'>
        <Button
          className='primary tiny flat'
          busy={accepted}
          onClick={onAccept}
        >
          <span>{t['Accept']}</span>
        </Button>

        <Button className='tiny flat' busy={declined} onClick={onDecline}>
          <span>{t['Ignore']}</span>
        </Button>
      </div>
    </li>
  );
};
