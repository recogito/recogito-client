import React from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import './ConfirmDelete.css';
import type { Translations } from 'src/Types';

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
        <AlertDialog.Overlay className="confirm-action-overlay" />
        <AlertDialog.Content className="confirm-action-context">
          <AlertDialog.Title className="confirm-action-title">{t['Are you sure you want to delete this assignment?']}</AlertDialog.Title>
          <AlertDialog.Description className="confirm-action-description">
            {t['Deleting this assignment will remove it from all users and will no longer be visible here.']}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className="button" onClick={props.onCancel}>{t['Cancel']}</button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button className="button primary" onClick={props.onConfirm}>{t['Delete']}</button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
