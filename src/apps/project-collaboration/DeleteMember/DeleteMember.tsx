import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Trash, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { PostgrestError } from '@supabase/supabase-js';
import { removeUserFromProject } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Member, UserProfile } from 'src/Types';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface DeleteMemberProps {

  me: UserProfile;

  member: Member;

  projectId: string;

  onDeleteMember(member: Member): void;

  onDeleteError(error: PostgrestError): void;
}

export const DeleteMember = (props: DeleteMemberProps) => {
  const { t } = useTranslation(['a11y', 'project-collaboration', 'common']);

  const { member } = props;

  const { nickname, first_name, last_name } = member.user;

  const isMe = props.me.id === member.user.id;

  const [busy, setBusy] = useState(false);

  const name = nickname
    ? nickname
    : first_name || last_name
    ? [first_name, last_name].join(' ')
    : undefined;

  const onDelete = () => {
    setBusy(true);

    removeUserFromProject(supabase, member.user.id, props.projectId).then(
      ({ error }) => {
        setBusy(false);

        if (error) {
          console.error(error);
          props.onDeleteError(error);
        } else {
          props.onDeleteMember(member);
        }
      }
    );
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          className='unstyled icon-only'
          aria-label={t('remove this user from the project', { ns: 'a11y' })}
        >
          <Trash size={16} color='black' />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay'>
          <DialogContent className='dialog-content'>
            <Dialog.Title className='dialog-title'>
              {isMe ? t('Leave Project?', { ns: 'project-collaboration' }) : t('Confirm Remove User', { ns: 'project-collaboration' })}
            </Dialog.Title>

            <Dialog.Description className='dialog-description'>
              {isMe ? (
                t('You are about to leave', { ns: 'project-collaboration' })
              ) : name ? (
                <span
                  dangerouslySetInnerHTML={{
                    __html: t('Remove_name', { ns: 'common' }).replace('${name}', name),
                  }}
                />
              ) : (
                t('Remove_anonymous', { ns: 'project-collaboration' })
              )}
            </Dialog.Description>

            <footer className='dialog-footer'>
              <Button
                busy={busy}
                className='danger'
                onClick={onDelete}
                aria-label={t('remove this user from the project', { ns: 'a11y' })}
              >
                {isMe ? (
                  t('Yes, I want to leave', { ns: 'project-collaboration' })
                ) : (
                  <>
                    <Trash size={16} />
                    <span>{t('Remove', { ns: 'project-collaboration' })}</span>
                  </>
                )}
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
