import { useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { declineInvitation, joinProject } from '@backend/helpers/invitationHelpers';
import type { Invitation, Project, Translations } from 'src/Types';

interface InvitationItemProps {
  
  i18n: Translations;

  invitation: Invitation;

  onAccepted(project: Project): void;

  onDeclined(): void;

  onError(error: string): void;

}

export const InvitationItem = (props: InvitationItemProps) => {

  const i = props.invitation;

  const [accepted, setAccepted] = useState(false);

  const [declined, setDeclined] = useState(false);

  const onAccept = () => {
    setAccepted(true);

    /*
    const minWait = new Promise(resolve => {
      setTimeout(() => resolve(null), 1000);
    });

    const join = joinProject(supabase, i);

    Promise.all([minWait, join]).then(([_, project]) => {
      props.onAccepted(project)
    })
    .catch(error => {
      props.onError(error);
    });
    */
  }

  const onDecline = () => {
    setDeclined(true);

    /*
    const minWait = new Promise(resolve => {
      setTimeout(() => resolve(null), 1000);
    });

    const decline = declineInvitation(supabase, i);

    Promise.all([minWait, decline]).then(([_, { error, data}]) => {        
      if (error)
        props.onError(error.message);
      else
        props.onDeclined();
    });
    */
  }

  return (
    <li>
      <p>
        <strong>{i.invited_by_name}</strong> invites you to join
        <strong>{i.project_name}</strong>.
      </p>
      
      <time>1 day ago</time>
      
      <div className="notification-actions">
        <Button 
          busy={accepted}
          onClick={onAccept}>
          <span>Accept</span>
        </Button>

        <Button
          busy={declined}
          onClick={onDecline}>  
          <span>Ignore</span>
        </Button>
      </div>
    </li>
  )

}