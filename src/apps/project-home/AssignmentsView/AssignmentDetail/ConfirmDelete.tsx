import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from 'react-i18next';

import './ConfirmDelete.css';

interface ConfirmDeleteProps {
  open: boolean;

  onConfirm(): void;
  onCancel(): void;
}

export const ConfirmDelete = (props: ConfirmDeleteProps) => {
  const { t } = useTranslation(['project-assignments', 'common']);

  return (
    <AlertDialog.Root open={props.open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />
        <AlertDialog.Content className='dialog-content-alt'>
          <AlertDialog.Title className='dialog-title-alt'>
            {t('Are you sure you want to delete this assignment?', { ns: 'project-assignments' })}
          </AlertDialog.Title>
          <AlertDialog.Description className='dialog-description-alt'>
            {
              t('Deleting this assignment will remove it from all users and will no longer be visible here.', { ns: 'project-assignments' })
            }
          </AlertDialog.Description>
          <div
            className='dialog-action'
            style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}
          >
            <AlertDialog.Cancel asChild>
              <button className='button' onClick={props.onCancel}>
                {t('Cancel', { ns: 'common' })}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className='button primary' onClick={props.onConfirm}>
                {t('Delete', { ns: 'common' })}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
