import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';

import './ConfirmDelete.css';

interface ConfirmDeleteProps {
  open: boolean;
  i18n: Translations;

  onConfirm(): void;
  onCancel(): void;
}

export const ConfirmDelete = (props: ConfirmDeleteProps) => {
  const { t } = props.i18n;

  return (
    <AlertDialog.Root open={props.open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />
        <AlertDialog.Content className='dialog-content-alt'>
          <AlertDialog.Title className='dialog-title-alt'>
            {t['Are you sure you want to delete this assignment?']}
          </AlertDialog.Title>
          <AlertDialog.Description className='dialog-description-alt'>
            {
              t[
                'Deleting this assignment will remove it from all users and will no longer be visible here.'
              ]
            }
          </AlertDialog.Description>
          <div
            className='dialog-action'
            style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}
          >
            <AlertDialog.Cancel asChild>
              <button className='button' onClick={props.onCancel}>
                {t['Cancel']}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className='button primary' onClick={props.onConfirm}>
                {t['Delete']}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
