import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type { ExtendedProjectData } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './JoinProjectDialog.css';

interface JoinProjectDialogProps {
  open: boolean;

  project: ExtendedProjectData;

  onClose(): void;

  onJoin(): void;
}

export const JoinProjectDialog = (props: JoinProjectDialogProps) => {
  const { t } = useTranslation(['dashboard-projects', 'common']);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {`${t('Join', { ns: 'dashboard-projects' })}: ${props.project.name}`}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t('Join Project Message', { ns: 'dashboard-projects' })}
          </Dialog.Description>

          <div className='join-project-dialog-button-container'>
            <button
              className='flat'
              onClick={props.onClose}
            >
              {t('Cancel', { ns: 'common' })}
            </button>
            <button
              className='primary flat'
              onClick={props.onJoin}
            >
              {t('Join', { ns: 'dashboard-projects' })}
            </button>
          </div>

          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t('Close', { ns: 'common' })}
            >
              <X onClick={props.onClose} />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
