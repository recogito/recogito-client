import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Invitation, Translations } from 'src/Types';

import './InvitationConfirmation.css';

interface InvitationConfirmationProps {

  i18n: Translations;

  invitation: Invitation;

  onClose(): void;

}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {

  const { invitation, i18n }  = props;

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className="invitation-confirmation dialog-content">
          <div className="success-icon">
            <AnimatedCheck size={36} />
          </div>

          <Dialog.Description className="dialog-description">
            <span dangerouslySetInnerHTML={{__html: i18n.t['Confirmed'].replace('${project}', invitation.project_name!)}} />
          </Dialog.Description>

          <img className="graphic-invitation-accepted" src="/img/graphic-invitation-accepted.png" />
          
          <Dialog.Close className="close" asChild>
            <button className="primary">Ok</button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}