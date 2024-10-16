import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';
import { Warning } from '@phosphor-icons/react';

import './LockWarningMessage.css';

interface LockWarningMessageProps {
  open: boolean;
  i18n: Translations;
  isLocked: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export const LockWarningMessage = (props: LockWarningMessageProps) => {
  const { open, isLocked } = props;
  const { t } = props.i18n;
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />
        <AlertDialog.Content className='dialog-content'>
          <AlertDialog.Title className='dialog-title lock-warning-title'>
            <Warning fill='red' className='warning-icon' size={24} />
            {isLocked ? t['Unlock Project'] : t['Lock Project']}
          </AlertDialog.Title>
          <AlertDialog.Description className='dialog-description'>
            {isLocked ? t['unlock_message'] : t['lock_warning_message']}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className='dialog-button' onClick={props.onCancel}>
                {t['Cancel']}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='dialog-button lock-warning-button-red'
                onClick={props.onConfirm}
              >
                {isLocked ? t['Unlock Project'] : t['Lock Project']}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
