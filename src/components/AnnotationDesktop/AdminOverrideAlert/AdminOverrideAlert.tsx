import * as Dialog from '@radix-ui/react-dialog';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './AdminOverrideAlert.css';

interface AdminOverrideAlertProps {

  open: boolean;

  onConfirm(): void;

  onCancel(): void;

}

export const AdminOverrideAlert = (props: AdminOverrideAlertProps) => {
  const { t } = useTranslation(['annotation-common', 'common']);

  const onOpenChange = (open: boolean) => {
    if (!open) props.onCancel();
  }

  return (
    <Dialog.Root open={props.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <DialogContent className='dialog-content admin-delete-alert'>
          <Dialog.Title className='dialog-title'>
            {t('With Great Power...', { ns: 'annotation-common' })}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t('...comes great responsibility.', { ns: 'annotation-common' })}
          </Dialog.Description>

          <div className='dialog-footer'>
            <button className='small flat' onClick={props.onCancel}>
              {t('Cancel', { ns: 'common' })}
            </button>
            
            <button className='primary small flat' onClick={props.onConfirm}>
              {t('Proceed', { ns: 'annotation-common' })}
            </button>
          </div>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )

}