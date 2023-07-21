import { useState } from 'react';
import { Envelope } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { joinProject, declineInvitation } from '@backend/helpers/invitationHelpers';
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

  const [busy, setBusy] = useState(false);

  const onAccept = () => {
    setBusy(true);

    joinProject(supabase, invitation)
      .then(project => {
        setBusy(false);
        props.onAccepted(project)
      })
      .catch(error => {
        setBusy(false);
        props.onError(error);
      });
  }

  const onDecline = () => {
    setBusy(true);

    declineInvitation(supabase, invitation)
      .then(({ error, data}) => {
        setBusy(false);
        console.log('declined', error, data);

        if (error)
          props.onError(error.message);
        else
          props.onDeclined();
      });
  }

  return (
    <div className="project-card invitation-card">
      <Envelope className="card-decoration" size={180} weight="thin" />
      {busy ? (
        <div>Please wait...</div>
      ) : (
        <div>
          <p>{invitation.invited_by_name} invites you to join:</p>
          <h1>{invitation.project_name}</h1>
            <div className="invitation-actions">
              <button 
                className="primary md flat"
                onClick={onAccept}>Accept</button>

              <button
                className="md flat"
                onClick={onDecline}>Decline</button>          
            </div>
        </div>
      )}
    </div>
  )

}