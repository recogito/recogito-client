import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';
import './ProfileNagDialog.css';
import { X } from '@phosphor-icons/react';

interface ProfileNagDialogProps {

  open: boolean;

  i18n: Translations;

  onRedirect(): void;

  onClose(): void;

}

export const ProfileNagDialog = (props: ProfileNagDialogProps) => {
  const { lang, t } = props.i18n;

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['User Profile']}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['User Profile Message']}
          </Dialog.Description>

          <div className="nag-dialog-button-container">
            <a className='button danger' href={`/${lang}/account/me`}>
              {t['Complete Profile']}
            </a>
          </div>

          <Dialog.Close asChild>
            <button className="dialog-close icon-only unstyled" aria-label={t['Close']}>
              <X onClick={props.onClose}  />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
