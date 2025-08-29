import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './ProfileNagDialog.css';

interface ProfileNagDialogProps {
  open: boolean;

  i18n: Translations;

  onClose(): void;
}

export const ProfileNagDialog = (props: ProfileNagDialogProps) => {
  const { lang, t } = props.i18n;

  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content
          className='dialog-content'
          aria-label={t['User Profile Message']}
        >
          <Dialog.Title className='dialog-title' aria-label='User Profile'>
            {t['User Profile']}
          </Dialog.Title>

          <Dialog.Description
            className='dialog-description'
            aria-label={t['User Profile Message']}
          >
            {t['User Profile Message']}
          </Dialog.Description>

          <div className='nag-dialog-button-container'>
            <a className='button danger' href={`/${lang}/account/me`}>
              {t['Complete Profile']}
            </a>
          </div>

          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t['Close']}
              tabIndex={0}
              onClick={props.onClose}
            >
              <X />
            </button>
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
