import * as Dialog from '@radix-ui/react-dialog';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Invitation, Translations } from 'src/Types';

import './InvitationConfirmation.css';

interface InvitationConfirmationProps {
  i18n: Translations;

  invitation: Invitation;

  isCreator?: boolean;

  onClose(): void;
}

export const InvitationConfirmation = (props: InvitationConfirmationProps) => {
  const { invitation, i18n } = props;

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='invitation-confirmation dialog-content'>
          <div className='success-icon'>
            <AnimatedCheck size={36} />
          </div>

          <Dialog.Description className='dialog-description'>
            <span
              dangerouslySetInnerHTML={{
                __html: props.isCreator
                  ? i18n.t['Confirmed-creator'].replace(
                      '${project}',
                      invitation.project_name!
                    )
                  : i18n.t['Confirmed-student'].replace(
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
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
