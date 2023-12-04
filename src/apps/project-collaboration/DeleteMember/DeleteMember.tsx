import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { PostgrestError } from '@supabase/supabase-js';
import type { TeamMember } from '../TeamMember';
import { removeUserFromProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Translations, UserProfile } from 'src/Types';

interface DeleteMemberProps {

  i18n: Translations;

  me: UserProfile;

  member: TeamMember;

  onDeleteMember(member: TeamMember): void;

  onDeleteError(error: PostgrestError): void;

}

export const DeleteMember = (props: DeleteMemberProps) => {

  const { t } = props.i18n;

  const { member } = props;

  const { nickname, first_name, last_name } = member.user;

  const isMe = props.me.id === member.user.id;

  const [busy, setBusy] = useState(false);

  const name = nickname ? nickname : 
    (first_name || last_name) ? [first_name, last_name].join(' ') : undefined;

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
              {isMe ? t['Leave Project?'] : t['Confirm Remove User']}
            </Dialog.Title>

            <Dialog.Description className="dialog-description">
              {isMe ? (
                t['You are about to leave']
              ) : name ? (
                <span dangerouslySetInnerHTML={{__html: t['Remove_name'].replace('${name}', name)}} />
              ) : (
                t['Remove_anonymous']
              )}
            </Dialog.Description>

            <footer className="dialog-footer">
              <Button 
                busy={busy}
                className="danger" 
                onClick={onDelete}>
                {isMe ? (
                  t['Yes, I want to leave'] 
                ) : (
                  <>
                    <Trash size={16} /> 
                    <span>{t['Remove']}</span>
                  </>
                )}
              </Button>

              <Dialog.Close asChild>
                <button>{t['Cancel']}</button>
              </Dialog.Close>
            </footer>

            <Dialog.Close asChild>
              <button className="unstyled icon-only dialog-close" aria-label={t['Close']}>
                <X />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  )

}