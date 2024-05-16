import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';

import './AdminOverrideAlert.css';

interface AdminOverrideAlertProps {

  i18n: Translations;

  open: boolean;

  onConfirm(): void;

  onCancel(): void;

}

export const AdminOverrideAlert = (props: AdminOverrideAlertProps) => {

  const { t } = props.i18n;

  const onOpenChange = (open: boolean) => {
    if (!open) props.onCancel();
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content admin-delete-alert'>
          <Dialog.Title className='dialog-title'>
            {t['With Great Power...']}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['...comes great responsibility.']}
          </Dialog.Description>

          <div className='dialog-footer'>
            <button className='small flat' onClick={props.onCancel}>
              {t['Cancel']}
            </button>
            
            <button className='primary small flat' onClick={props.onConfirm}>
              {t['Proceed']}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}