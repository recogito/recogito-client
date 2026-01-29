import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { Warning } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './DeleteWarningMessage.css';

interface DeleteWarningMessageProps {
  open: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export const DeleteWarningMessage = (props: DeleteWarningMessageProps) => {
  const { open } = props;
  const { t } = useTranslation(['user-management', 'common']);
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='delete-warning-overlay' />
        <AlertDialog.Content className='delete-warning-content'>
          <AlertDialog.Title className='delete-warning-title'>
            <Warning fill='red' className='warning-icon' size={24} />
            {t('Delete User', { ns: 'user-management' })}
          </AlertDialog.Title>
          <AlertDialog.Description className='delete-warning-description'>
            {t('Delete_Warning_Message', { ns: 'user-management' })}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button
                className='delete-warning-button'
                onClick={props.onCancel}
              >
                {t('Cancel', { ns: 'common' })}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='delete-warning-button-red'
                onClick={props.onConfirm}
              >
                {t('Delete User', { ns: 'user-management' })}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
