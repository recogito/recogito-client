import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';
import { Warning } from '@phosphor-icons/react';

import './RequestResultMessage.css';

interface RequestResultMessageProps {
  open: boolean;
  i18n: Translations;
  onCancel(): void;
  onConfirm(): void;
}

export const RequestResultMessage = (props: RequestResultMessageProps) => {
  const { open } = props;
  const { t } = props.i18n;
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='request-result-overlay' />
        <AlertDialog.Content className='request-result-content'>
          <AlertDialog.Title className='request-result-title'>
            <Warning fill='red' className='warning-icon' size={24} />
            {t['Delete User']}
          </AlertDialog.Title>
          <AlertDialog.Description className='request-result-description'>
            {t['Delete_Warning_Message']}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button
                className='request-result-button'
                onClick={props.onCancel}
              >
                {t['Cancel']}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='request-result-button-red'
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
