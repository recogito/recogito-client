import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './DocumentLibrary.css';

interface ConfirmDeleteDialogProps {

  open: boolean;

  busy?: boolean;

  title: string;

  description: string;

  cancelLabel: string | ReactNode;

  confirmLabel: string | ReactNode;

  onConfirm(): void;

  onClose(): void;
}

export const ConfirmDeleteDialog = (props: ConfirmDeleteDialogProps) => {
  const { t } = useTranslation(['common']);
  return (
    <Dialog.Root open={props.open}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay doc-lib-confirm-overlay'>
          <DialogContent className='dialog-content doc-lib-confirm-content'>
            <Dialog.Title className='dialog-title'>{props.title}</Dialog.Title>

            <Dialog.Description className='dialog-description'>
              {props.description}
            </Dialog.Description>

            <footer className='dialog-footer'>
              <Button
                busy={props.busy}
                className='danger'
                onClick={props.onConfirm}
              >
                {props.confirmLabel}
              </Button>
              <button onClick={props.onClose}>{props.cancelLabel}</button>
            </footer>
            <button
              className='unstyled icon-only dialog-close'
              aria-label={t('Close', { ns: 'common' })}
              onClick={props.onClose}
            >
              <X />
            </button>
          </DialogContent>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
