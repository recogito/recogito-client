import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type { Invitation, Translations } from 'src/Types';

interface InvitationConfirmationProps {

  i18n: Translations;

  invitation: Invitation;

  onClose(): void;

}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className="invite-users dialog-content">
          <Dialog.Title className="dialog-title">
            Joined!
          </Dialog.Title>

          <Dialog.Description className="dialog-description">
            Congratulations.
          </Dialog.Description>

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