import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Envelope, User, X } from '@phosphor-icons/react';
import { useFormik } from 'formik';
import { inviteUserToProject } from '@backend/crud';
import { Button } from '@components/Button';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
} from 'src/Types';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';

import './InviteUserDialog.css';

interface InviteUserProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  invitations: Invitation[];

  open: boolean;

  onInvitiationSent(invitation: Invitation): void;

  onInvitiationError(error: PostgrestError): void;

  onClose(): void;
}

export const InviteUserDialog = (props: InviteUserProps) => {
  const { lang, t } = props.i18n;

  const { me, project } = props;

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);

  const invitedBy = me.nickname
    ? me.nickname
    : me.first_name || me.last_name
    ? [me.first_name, me.last_name].join(' ')
    : undefined;

  useEffect(() => {
    formik.resetForm();
    setError(undefined);
  }, [props.open]);

  const sendInvitation = (email: string, group: string) => {
    setBusy(true);

    // Waits until the invite was processed in the backend
    const a = new Promise((resolve) => {
      inviteUserToProject(supabase, email, project, group, invitedBy).then(
        (invitation) => {
          if (!invitation) {
            //props.onInvitiationError('Failed to invite user');
          } else {
            props.onInvitiationSent(invitation);
          }

          resolve(null);
        }
      );

      resolve(null);
    });

    // Waits for fixed amount of time, so that confetti can complete
    const b = new Promise((resolve) => {
      setTimeout(() => resolve(null), 1500);
    });

    // Waits for whatever is takes longer and closes the dialog
    return Promise.all([a, b]).then(() => {
      setBusy(false);
      props.onClose();
    });
  };

  const onSubmit = (values: { email: string; group: string }) => {
    const { email, group } = values;

    // Because you never know what users do...
    const toMyself = props.me.email === email;

    const hasInvitation = props.invitations.some(
      (i) => i.email.toLowerCase() === email.toLowerCase()
    );

    if (toMyself) {
      setError(t['You cannot send an invitation to yourself.']);
    } else if (hasInvitation) {
      setError(t['This user already has an invitation waiting.']);
    } else {
      sendInvitation(email, group).then(() => formik.resetForm());
    }
  };

  const formik = useFormik({
    initialValues: {
      email: '',
      // TODO maybe a better way to handle this?
      // Default to last in list
      group: project.groups[project.groups.length - 1].id,
    },
    onSubmit,
  });

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content className='invite-users dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t['Invite User to Project']}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t['Enter e-mail and access level.']}
          </Dialog.Description>

          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              <div className='field'>
                <label>{t['E-Mail']}</label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  required
                  aria-label={t['enter user email address']}
                />
              </div>

              <div className='field'>
                <label>{t['Access Level']}</label>

                <select
                  id='group'
                  name='group'
                  onChange={formik.handleChange}
                  value={formik.values.group}
                  aria-label={t['select users access level']}
                >
                  {props.project.groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                      aria-label={t[group.name]}
                    >
                      {t[group.name]}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className='error'>{error}</div>}
            </fieldset>

            <Button busy={busy} confetti className='primary' type='submit'>
              <Envelope size={20} />
              <span>{t['Send invitation']}</span>
            </Button>
          </form>

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
  );
};
