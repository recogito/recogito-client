import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Invitation, Translations } from 'src/Types';

interface InvitationConfirmationProps {

  i18n: Translations;

  invitation: Invitation;

  onClose(): void;

}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {

  const { invitation }  = props;

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className="invite-users dialog-content">

          <Dialog.Description className="dialog-description">
            <AnimatedCheck />
            You're in! <strong>{invitation.project_name}</strong> has been added to your Dashboard.
            You will find it under 'All' or 'Shared with me'.
          </Dialog.Description>

          <img className="styled-graphic" src="/img/graphic-accepted-invitation.png" />

          <Dialog.Close asChild>
            <button className="dialog-close icon-only unstyled" aria-label="Close">
              <X size={16} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}