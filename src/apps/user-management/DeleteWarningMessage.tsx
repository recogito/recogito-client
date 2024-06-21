import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';
import { Warning } from '@phosphor-icons/react';

import './DeleteWarningMessage.css';

interface DeleteWarningMessageProps {
  open: boolean;
  i18n: Translations;
  onCancel(): void;
  onConfirm(): void;
}

export const DeleteWarningMessage = (props: DeleteWarningMessageProps) => {
  const { open } = props;
  const { t } = props.i18n;
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='delete-warning-overlay' />
        <AlertDialog.Content className='delete-warning-content'>
          <AlertDialog.Title className='delete-warning-title'>
            <Warning fill='red' className='warning-icon' size={24} />
            {t['Delete User']}
          </AlertDialog.Title>
          <AlertDialog.Description className='delete-warning-description'>
            {t['Delete_Warning_Message']}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button
                className='delete-warning-button'
                onClick={props.onCancel}
              >
                {t['Cancel']}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='delete-warning-button-red'
                onClick={props.onConfirm}
              >
                {t['Delete User']}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
