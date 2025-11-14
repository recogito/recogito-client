import * as Dialog from '@radix-ui/react-dialog';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Invitation } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './InvitationConfirmation.css';

interface InvitationConfirmationProps {

  invitation: Invitation;

  isCreator?: boolean;

  onClose(): void;
}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {
  const { invitation } = props;
  const { t } = useTranslation(['notifications']);

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='invitation-confirmation dialog-content'>
          <div className='success-icon'>
            <AnimatedCheck size={36} />
          </div>

          <Dialog.Description className='dialog-description'>
            <span
              dangerouslySetInnerHTML={{
                __html: props.isCreator
                  ? t('Confirmed-creator', { ns: 'notifications' }).replace(
                      '${project}',
                      invitation.project_name!
                    )
                  : t('Confirmed-student', { ns: 'notifications' }).replace(
                      '${project}',
                      invitation.project_name!
                    ),
              }}
            />
          </Dialog.Description>

          {props.isCreator ? (
            <img
              className='graphic-invitation-accepted'
              alt='invite-accepted'
              src='/img/graphic-invitation-accepted-creators.png'
            />
          ) : (
            <img
              className='graphic-invitation-accepted'
              alt='invite-accepted'
              src='/img/graphic-invitation-accepted-student.png'
            />
          )}

          <Dialog.Close className='close' asChild>
            <button className='primary'>Ok</button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
