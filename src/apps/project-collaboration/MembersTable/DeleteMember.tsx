import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { PostgrestError } from '@supabase/supabase-js';
import type { TeamMember } from '../TeamMember';
import { removeUserFromProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';

interface DeleteMemberProps {

  member: TeamMember;

  onDeleteMember(member: TeamMember): void;

  onDeleteError(error: PostgrestError): void;

}

export const DeleteMember = (props: DeleteMemberProps) => {

  const { member } = props;

  const [busy, setBusy] = useState(false);

  const name = 'foo';

  const onDelete = () => {
    setBusy(true);

    removeUserFromProject(supabase, member.user.id, member.inGroup.id)
      .then(({ error }) => {
        setBusy(false);

        if (error) {
          console.error(error);
          props.onDeleteError(error);
        } else {
          props.onDeleteMember(member);
        }
      });
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className="unstyled icon-only">
          <Trash size={16} />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay">
          <Dialog.Content className="dialog-content">
            <Dialog.Title className="dialog-title">
              Confirm Remove User
            </Dialog.Title>

            <Dialog.Description className="dialog-description">
              Are you sure you wish to remove the user {name ? name + ' ' : ''}from the project?
            </Dialog.Description>

            <footer className="dialog-footer">
              <Button 
                busy={busy}
                className="danger" 
                onClick={onDelete}>
                <Trash size={16} /> <span>Remove</span>
              </Button>

              <Dialog.Close asChild>
                <button>Cancel</button>
              </Dialog.Close>
            </footer>

            <Dialog.Close asChild>
              <button className="unstyled icon-only dialog-close" aria-label="Close">
                <X />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )

}