import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Envelope, UsersFour, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
} from 'src/Types';
import type { PostgrestError } from '@supabase/supabase-js';
import Dropzone from 'react-dropzone';

import './InviteListOfUsers.css';

interface InviteListOfUsersProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;
}

export const InviteListOfUsers = (props: InviteListOfUsersProps) => {
  const { lang, t } = props.i18n;

  const { me } = props;

  const [open, _setOpen] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);

  const invitedBy = me.nickname
    ? me.nickname
    : me.first_name || me.last_name
    ? [me.first_name, me.last_name].join(' ')
    : undefined;

  const setOpen = (open: boolean) => {
    setError(undefined);
    _setOpen(open);
  };

  const handleFileDropped = (files) => {
    console.log(files);
  };

  return (
    <>
      <button
        disabled={!invitedBy}
        className='primary'
        onClick={() => setOpen(true)}
      >
        <UsersFour size={20} />
        <span>{t['Add list of users']}</span>
      </button>

      {!invitedBy && (
        <p className='anonymous-warning'>
          <span
            dangerouslySetInnerHTML={{
              __html: t['You must set a name'].replace(
                '${url}',
                `/${lang}/account/me`
              ),
            }}
          ></span>
        </p>
      )}

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className='dialog-overlay' />

          <Dialog.Content className='invite-users dialog-content'>
            <Dialog.Title className='dialog-title'>
              {t['Invite Users to the Project']}
            </Dialog.Title>

            <Dropzone
              onDrop={(acceptedFiles) => handleFileDropped(acceptedFiles)}
              multiple={false}
            >
              {({ getRootProps, getInputProps }) => (
                <section className='invite-list-section'>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>{t['invite-list-instructions']}</p>
                    <p>{t['invite-list-instructions-2']}</p>
                    <img
                      src='/img/invite-user-list.png'
                      height={200}
                      width={350}
                    ></img>
                  </div>
                </section>
              )}
            </Dropzone>

            <Button busy={busy} confetti className='primary' type='submit'>
              <Envelope size={20} />
              <span>{t['Send invitation']}</span>
            </Button>

            <Dialog.Close asChild>
              <button
                className='dialog-close icon-only unstyled'
                aria-label={t['Close']}
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};
