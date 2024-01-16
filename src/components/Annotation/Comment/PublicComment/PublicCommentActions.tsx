import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import * as Dialog from '@radix-ui/react-dialog';
import { DotsThreeVertical, Pencil, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface PublicCommentActionsProps {
  i18n: Translations;

  isFirst?: boolean;

  isMine: boolean;

  onDeleteAnnotation(): void;

  onDeleteComment(): void;

  onEditComment(): void;
}

export const PublicCommentActions = (props: PublicCommentActionsProps) => {
  const { t } = props.i18n;

  const [confirmableFn, setConfirmableFn] = useState<() => void | undefined>();

  const withAlert = (fn: () => void) => {
    if (props.isMine) {
      return fn;
    } else {
      return () => setConfirmableFn(() => fn);
    }
  };

  const onConfirm = () => {
    confirmableFn!();
    setConfirmableFn(undefined);
  };

  return (
    <>
      <Dropdown.Root>
        <Dropdown.Trigger asChild>
          <button className='comment-actions unstyled icon-only'>
            <DotsThreeVertical size={20} weight='bold' />
          </button>
        </Dropdown.Trigger>

        <Dropdown.Portal>
          <Dropdown.Content asChild sideOffset={5} align='start'>
            <div className='dropdown-content no-icons'>
              {props.isFirst && (
                <>
                  <Dropdown.Item
                    className='dropdown-item'
                    onSelect={withAlert(props.onDeleteAnnotation)}
                  >
                    <Trash size={16} /> <span>{t['Delete annotation']}</span>
                  </Dropdown.Item>
                </>
              )}

              <Dropdown.Item
                className='dropdown-item'
                onSelect={withAlert(props.onEditComment)}
              >
                <Pencil size={16} /> <span>{t['Edit comment']}</span>
              </Dropdown.Item>

              <Dropdown.Item
                className='dropdown-item'
                onSelect={withAlert(props.onDeleteComment)}
              >
                <Trash size={16} /> <span>{t['Delete comment']}</span>
              </Dropdown.Item>
            </div>
          </Dropdown.Content>
        </Dropdown.Portal>
      </Dropdown.Root>

      <AdminOverrideAlert
        i18n={props.i18n}
        open={Boolean(confirmableFn)}
        onConfirm={onConfirm}
        onCancel={() => setConfirmableFn(undefined)}
      />
    </>
  );
};

interface AdminOverrideAlertProps {
  i18n: Translations;

  open: boolean;

  onConfirm(): void;

  onCancel(): void;
}

export const AdminOverrideAlert = (props: AdminOverrideAlertProps) => {
  const { t } = props.i18n;

  const onOpenChange = (open: boolean) => {
    if (!open) props.onCancel();
  };

  return (
    <Dialog.Root open={props.open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <Dialog.Content className='dialog-content admin-override-alert'>
          <Dialog.Title className='dialog-title'>
            {t['With Great Power...']}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['...comes great responsibility.']}
          </Dialog.Description>

          <div className='dialog-footer'>
            <button className='small' onClick={props.onCancel}>
              {t['Cancel']}
            </button>
            <button className='primary small' onClick={props.onConfirm}>
              {t['Proceed']}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
