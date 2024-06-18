import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type { ExtendedProjectData, Translations } from 'src/Types';

import './JoinProjectDialog.css';

interface JoinProjectDialogProps {
  open: boolean;

  i18n: Translations;

  project: ExtendedProjectData;

  onClose(): void;

  onJoin(): void;
}

export const JoinProjectDialog = (props: JoinProjectDialogProps) => {
  const { t } = props.i18n;

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {`${t['Join']} ${props.project.name}`}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['Join Project Message']}
          </Dialog.Description>

          <div className='join-project-dialog-button-container'>
            <button
              className='join-project-dialog-button-cancel'
              onClick={props.onClose}
            >
              {t['Cancel']}
            </button>
            <button
              className='join-project-dialog-button-join'
              onClick={props.onJoin}
            >
              {t['Join']}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t['Close']}
            >
              <X onClick={props.onClose} />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
