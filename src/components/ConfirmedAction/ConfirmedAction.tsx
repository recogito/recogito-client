import type { ReactNode } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface ConfirmedActionTriggerProps {

  children: ReactNode;

}

const Root = Dialog.Root;

const Trigger = (props: ConfirmedActionTriggerProps) => {

  return (
    <Dialog.Trigger asChild>
      {props.children}
    </Dialog.Trigger>
  )

}

interface ConfirmationDialogProps {

  busy?: boolean;

  title: string;

  description: string;

  cancelLabel: string | ReactNode;

  confirmLabel: string | ReactNode;

  onConfirm(): void;

}

const ConfirmationDialog = (props: ConfirmationDialogProps) => {
  
  const { t } = useTranslation(['common']);
  
  const onClick = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  return (
    <Dialog.Portal>
      <Dialog.Overlay className="dialog-overlay">
        <DialogContent 
          className="dialog-content" 
          onClick={onClick}>

          <Dialog.Title className="dialog-title">
            {props.title}
          </Dialog.Title>

          <Dialog.Description className="dialog-description">
            {props.description}
          </Dialog.Description>

          <footer className="dialog-footer">
            <Button
              busy={props.busy}
              className="danger"
              onClick={props.onConfirm}>
              {props.confirmLabel}
            </Button>

            <Dialog.Close asChild>
              <button>{props.cancelLabel}</button>
            </Dialog.Close>
          </footer>

          <Dialog.Close asChild>
            <button 
              className="unstyled icon-only dialog-close" 
              aria-label={t('Close', { ns: 'common' })}>
              <X />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Overlay>
    </Dialog.Portal>
  )

}

export const ConfirmedAction = { Root, Trigger, Dialog: ConfirmationDialog };