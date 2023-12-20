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
    <Dialog.Root open={open} modal={false}>
      <Dialog.Portal>
        <Dialog.Overlay className='nag-dialog-overlay' />
        <Dialog.Content className='nag-dialog-content'>
          <Dialog.Title className='nag-dialog-title'>
            {t['User Profile']}
            <X onClick={props.onClose} className='nag-dialog-close' />
          </Dialog.Title>
          <Dialog.Description className='nag-dialog-description'>
            {t['User Profile Message']}
          </Dialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <button
              className='nag-dialog-button-red'
              onClick={props.onRedirect}
            >
              {t['Complete Profile']}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
