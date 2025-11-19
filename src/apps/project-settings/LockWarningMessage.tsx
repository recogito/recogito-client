import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from 'react-i18next';

import './LockWarningMessage.css';

interface LockWarningMessageProps {
  open: boolean;
  isLocked: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export const LockWarningMessage = (props: LockWarningMessageProps) => {
  const { open, isLocked } = props;
  const { t } = useTranslation(['common', 'project-settings']);
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />
        <AlertDialog.Content className='dialog-content-alt'>
          <AlertDialog.Title className='dialog-title-alt lock-warning-title'>
            {isLocked
              ? t('Unlock Project', { ns: 'common' })
              : t('Are you sure you want to lock this project?', { ns: 'project-settings' })}
          </AlertDialog.Title>
          <AlertDialog.Description className='dialog-description-alt'>
            {isLocked ? t('unlock_message', { ns: 'project-settings' }) : t('lock_warning_message', { ns: 'project-settings' })}
          </AlertDialog.Description>
          <div
            style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}
            className='dialog-action'
          >
            <AlertDialog.Cancel asChild>
              <button className='dialog-button cancel' onClick={props.onCancel}>
                {t('Cancel', { ns: 'common' })}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='dialog-button primary'
                onClick={props.onConfirm}
              >
                {isLocked ? t('Unlock Project', { ns: 'common' }) : t('Lock Project', { ns: 'project-settings' })}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
