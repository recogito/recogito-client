import { useState } from 'react';
import { Envelope } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { joinProject, declineInvitation } from '@backend/helpers/invitationHelpers';
import { Button } from '@components/Button';
import type { Invitation, Project, Translations } from 'src/Types';

import './InvitationCard.css';

interface InvitationCardProps {

  i18n: Translations;

  invitation: Invitation;

  onAccepted(project: Project): void;

  onDeclined(): void;

  onError(error: string): void;

}

export const InvitationCard = (props: InvitationCardProps) => {

  const { invitation } = props;

  const [accepted, setAccepted] = useState(false);

  const [declined, setDeclined] = useState(false);

  const onAccept = () => {
    setAccepted(true);

    const minWait = new Promise(resolve => {
      setTimeout(() => resolve(null), 1000);
    });

    const join = joinProject(supabase, invitation);

    Promise.all([minWait, join]).then(([_, project]) => {
      props.onAccepted(project)
    })
    .catch(error => {
      props.onError(error);
    });
  }

  const onDecline = () => {
    setDeclined(true);

    const minWait = new Promise(resolve => {
      setTimeout(() => resolve(null), 1000);
    });

    const decline = declineInvitation(supabase, invitation);

    Promise.all([minWait, decline]).then(([_, { error, data}]) => {        
      if (error)
        props.onError(error.message);
      else
        props.onDeclined();
    });
  }

  return (
    <div className="project-card invitation-card">
      <div className="card-decoration">
        <Envelope size={180} weight="thin" />
      </div>

      <div>
        <p>{invitation.invited_by_name} invites you to join:</p>
        <h1>{invitation.project_name}</h1>
          <div className="invitation-actions">
            <Button
              confetti
              busy={accepted}
              className="primary md flat"
              onClick={onAccept}>
              <span>Accept</span>
            </Button>


            <Button
              busy={declined}
              className="md flat"
              onClick={onDecline}>
              <span>Decline</span>
            </Button>          
          </div>
      </div>
    </div>
  )

}