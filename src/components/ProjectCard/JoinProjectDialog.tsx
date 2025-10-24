import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { DialogContent } from '@components/DialogContent';

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

        <DialogContent className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {`${t['Join']}: ${props.project.name}`}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['Join Project Message']}
          </Dialog.Description>

          <div className='join-project-dialog-button-container'>
            <button
              className='flat'
              onClick={props.onClose}
            >
              {t['Cancel']}
            </button>
            <button
              className='primary flat'
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
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
