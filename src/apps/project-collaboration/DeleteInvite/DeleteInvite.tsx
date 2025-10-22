import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { Invitation, Translations } from 'src/Types';
import { deleteInvitation } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import type { PostgrestError } from '@supabase/supabase-js';
import { DialogContent } from '@components/DialogContent';

interface DeleteInviteProps {
  i18n: Translations;

  invitation: Invitation;

  onDeleteInvite(invitation: Invitation): void;

  onDeleteError(error: PostgrestError): void;
}

export const DeleteInvite = (props: DeleteInviteProps) => {
  const { t } = props.i18n;

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
          aria-label={t['delete this unaccepted invitation']}
        >
          <Trash size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay'>
          <DialogContent className='dialog-content'>
            <Dialog.Title className='dialog-title'>
              {t['Confirm Delete Invite']}
            </Dialog.Title>

            <Dialog.Description className='dialog-description'>
              {
                <span
                  dangerouslySetInnerHTML={{
                    __html: t['Delete_invite'].replace('${email}', email),
                  }}
                />
              }
            </Dialog.Description>

            <footer className='dialog-footer'>
              <Button busy={busy} className='danger' onClick={onDelete}>
                {
                  <>
                    <Trash size={16} />
                    <span>{t['Delete']}</span>
                  </>
                }
              </Button>

              <Dialog.Close asChild>
                <button>{t['Cancel']}</button>
              </Dialog.Close>
            </footer>

            <Dialog.Close asChild>
              <button
                className='unstyled icon-only dialog-close'
                aria-label={t['Close']}
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
