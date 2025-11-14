import { useEffect, useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Envelope, X } from '@phosphor-icons/react';
import { useFormik } from 'formik';
import { inviteUserToProject } from '@backend/crud';
import { Button } from '@components/Button';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
} from 'src/Types';
import type { PostgrestError } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './InviteUserDialog.css';

interface InviteUserProps {

  me: MyProfile;

  project: ExtendedProjectData;

  invitations: Invitation[];

  open: boolean;

  onInvitiationSent(invitation: Invitation): void;

  onInvitiationError(error: PostgrestError): void;

  onClose(): void;
}

export const InviteUserDialog = (props: InviteUserProps) => {
  const { t } = useTranslation(['project-collaboration', 'common', 'a11y']);

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

    // Waits for processing and closes the dialog
    return a.then(() => {
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
      setError(t('You cannot send an invitation to yourself.', { ns: 'project-collaboration' }));
    } else if (hasInvitation) {
      setError(t('This user already has an invitation waiting.', { ns: 'project-collaboration' }));
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

        <DialogContent className='invite-users dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t('Invite User to Project', { ns: 'project-collaboration' })}
          </Dialog.Title>

          <Dialog.Description className='dialog-description'>
            {t('Enter e-mail and access level.', { ns: 'project-collaboration' })}
          </Dialog.Description>

          <form onSubmit={formik.handleSubmit}>
            <fieldset>
              <div className='field'>
                <label>{t('E-Mail', { ns: 'common' })}</label>
                <input
                  id='email'
                  name='email'
                  type='email'
                  onChange={formik.handleChange}
                  value={formik.values.email}
                  required
                  aria-label={t('enter user email address', { ns: 'a11y' })}
                />
              </div>

              <div className='field'>
                <label>{t('Access Level', { ns: 'common' })}</label>

                <select
                  id='group'
                  name='group'
                  onChange={formik.handleChange}
                  value={formik.values.group}
                  aria-label={t('select users access level', { ns: 'a11y' })}
                >
                  {props.project.groups.map((group) => (
                    <option
                      key={group.id}
                      value={group.id}
                      aria-label={t(group.name)}
                    >
                      {t(group.name)}
                    </option>
                  ))}
                </select>
              </div>

              {error && <div className='error'>{error}</div>}
            </fieldset>

            <Button busy={busy} className='primary' type='submit'>
              <Envelope size={20} />
              <span>{t('Send invitation', { ns: 'project-collaboration' })}</span>
            </Button>
          </form>

          <Dialog.Close asChild>
            <button
              className='dialog-close icon-only unstyled'
              aria-label={t('Close', { ns: 'common' })}
            >
              <X size={16} />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
