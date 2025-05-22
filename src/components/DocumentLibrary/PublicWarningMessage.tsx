import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';

interface PublicWarningMessageProps {
  open: boolean;
  message: string;
  i18n: Translations;
  onCancel(): void;
  onConfirm(): void;
}

export const PublicWarningMessage = (props: PublicWarningMessageProps) => {
  const { open, message } = props;
  const { t } = props.i18n;
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='alert-dialog-overlay' />
        <AlertDialog.Content className='alert-dialog-content'>
          <AlertDialog.Title className='alert-dialog-title'>
            {t['Make Document Public']}
          </AlertDialog.Title>
          <AlertDialog.Description className='alert-dialog-description'>
            {message}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className='alert-dialog-button' onClick={props.onCancel}>
                {t['Cancel']}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='alert-dialog-button-red'
                onClick={props.onConfirm}
              >
                {t['Make Public']}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
