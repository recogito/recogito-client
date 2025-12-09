import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { Invitation } from 'src/Types';
import { deleteInvitation } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import type { PostgrestError } from '@supabase/supabase-js';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface DeleteInviteProps {

  invitation: Invitation;

  onDeleteInvite(invitation: Invitation): void;

  onDeleteError(error: PostgrestError): void;
}

export const DeleteInvite = (props: DeleteInviteProps) => {
  const { t } = useTranslation(['a11y', 'project-collaboration', 'common']);

  const { invitation } = props;

  const { email } = invitation;

  const [busy, setBusy] = useState(false);

  const onDelete = () => {
    setBusy(true);

    deleteInvitation(supabase, invitation).then(({ error }) => {
      setBusy(false);

      if (error) {
        console.error(error);
        props.onDeleteError(error);
      } else {
        props.onDeleteInvite(invitation);
      }
    });
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className='unstyled icon-only'
          aria-label={t('delete this unaccepted invitation', { ns: 'a11y' })}
        >
          <Trash size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay'>
          <DialogContent className='dialog-content'>
            <Dialog.Title className='dialog-title'>
              {t('Confirm Delete Invite', { ns: 'project-collaboration' })}
            </Dialog.Title>

            <Dialog.Description className='dialog-description'>
              <span>{t('deleteInvite', { ns: 'project-collaboration', email })}</span>
            </Dialog.Description>

            <footer className='dialog-footer'>
              <Button busy={busy} className='danger' onClick={onDelete}>
                {
                  <>
                    <Trash size={16} />
                    <span>{t('Delete', { ns: 'common' })}</span>
                  </>
                }
              </Button>

              <Dialog.Close asChild>
                <button>{t('Cancel', { ns: 'common' })}</button>
              </Dialog.Close>
            </footer>

            <Dialog.Close asChild>
              <button
                className='unstyled icon-only dialog-close'
                aria-label={t('Close', { ns: 'common' })}
              >
                <X />
              </button>
            </Dialog.Close>
          </DialogContent>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
