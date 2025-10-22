import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { Translations } from 'src/Types';
import { DialogContent } from '@components/DialogContent';

interface ConfirmDeleteDialogProps {
  i18n: Translations;

  open: boolean;

  busy?: boolean;

  title: string;

  description: string;

  cancelLabel: string | ReactNode;

  confirmLabel: string | ReactNode;

  onConfirm(): void;

  onClose(): void;
}

import './DocumentLibrary.css';

export const ConfirmDeleteDialog = (props: ConfirmDeleteDialogProps) => {
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
              aria-label={props.i18n.t['Close']}
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
