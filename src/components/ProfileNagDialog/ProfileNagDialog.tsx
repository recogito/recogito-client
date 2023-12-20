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
  const { open } = props;
  
  const { t } = props.i18n;

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
            <button className='danger'
              onClick={props.onRedirect}>
              {t['Complete Profile']}
            </button>
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
