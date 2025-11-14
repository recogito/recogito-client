import * as Dialog from '@radix-ui/react-dialog';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Invitation } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { Trans } from 'react-i18next';

import './InvitationConfirmation.css';

interface InvitationConfirmationProps {

  invitation: Invitation;

  isCreator?: boolean;

  onClose(): void;
}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {
  const { invitation } = props;

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='invitation-confirmation dialog-content'>
          <div className='success-icon'>
            <AnimatedCheck size={36} />
          </div>

          <Dialog.Description className='dialog-description'>
            <span>
              <Trans
                i18nKey={props.isCreator ? 'confirmedCreator' : 'confirmedStudent'}
                ns='notifications'
                values={{ project: invitation.project_name }}
                components={{ strong: <strong /> }}
              />
            </span>
          </Dialog.Description>
          <img
            className='graphic-invitation-accepted'
            alt='invite-accepted'
            src={`/img/graphic-invitation-accepted-${props.isCreator ? 'creators' : 'student'}.png`}
          />
          <Dialog.Close className='close' asChild>
            <button className='primary'>Ok</button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
