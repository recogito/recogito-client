import { useState } from 'react';
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
    <div className="invitation-card">
      {busy ? (
        <div>Please wait...</div>
      ) : (
        <div>
          <h1>{invitation.project_name}</h1>
          <p>You have been invited to join this project by {invitation.invited_by_name}</p>
            <div className="notification-actions">
              <button 
                className="success" 
                onClick={onAccept}>Accept</button>

              <button
                onClick={onDecline}>Decline</button>          
            </div>
        </div>
      )}
    </div>
  )

}