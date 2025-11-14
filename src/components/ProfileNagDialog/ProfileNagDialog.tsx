import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './ProfileNagDialog.css';

interface ProfileNagDialogProps {
  open: boolean;

  onClose(): void;
}

export const ProfileNagDialog = (props: ProfileNagDialogProps) => {
  const { i18n, t } = useTranslation(['dashboard-projects', 'common']);

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent
          className='dialog-content'
          aria-label={t('User Profile Message', { ns: 'dashboard-projects' })}
        >
          <Dialog.Title className='dialog-title' aria-label='User Profile'>
            {t('User Profile', { ns: 'dashboard-projects' })}
          </Dialog.Title>

          <Dialog.Description
            className='dialog-description'
            aria-label={t('User Profile Message', { ns: 'dashboard-projects' })}
          >
            {t('User Profile Message', { ns: 'dashboard-projects' })}
          </Dialog.Description>

          <div className='nag-dialog-button-container'>
            <a className='button danger' href={`/${i18n.language}/account/me`}>
              {t('Complete Profile', { ns: 'dashboard-projects' })}
            </a>
          </div>

          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t('Close', { ns: 'common' })}
              tabIndex={0}
              onClick={props.onClose}
            >
              <X />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
