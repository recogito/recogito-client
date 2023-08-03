import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Envelope, UserPlus, X } from '@phosphor-icons/react';
import { useFormik } from 'formik';
import { supabase } from '@backend/supabaseBrowserClient';
import { inviteUserToProject } from '@backend/crud';
import { Button } from '@components/Button';
import type { ExtendedProjectData, Invitation, MyProfile, Translations, UserProfile } from 'src/Types';
import type { PostgrestError } from '@supabase/supabase-js';

interface InviteUserProps {

  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  invitations: Invitation[];

  onInvitiationSent(invitation: Invitation): void;

  onInvitiationError(error: PostgrestError): void;

}

export const InviteUser = (props: InviteUserProps) => {

  const { t } = props.i18n;

  const { me, project } = props;

  const [open, _setOpen] = useState(false);

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState<string | undefined>(undefined);

  const setOpen = (open: boolean) => {
    formik.resetForm();
    setError(undefined);
    _setOpen(open);
  }

  const sendInvitation = (email: string, group: string) => {
    const invitedBy = me.nickname ? 
      me.nickname : (me.first_name || me.last_name) ?
      [me.first_name, me.last_name].join(' ') :
      undefined;

    setBusy(true);

    // Waits until the invite was processed in the backend
    const a = new Promise(resolve => {
      inviteUserToProject(supabase, email, project, group, invitedBy)
        .then(({ error, data }) => {
          if (error) {
            props.onInvitiationError(error);
          } else {
            props.onInvitiationSent(data);
          }

          resolve(null);
        });

      resolve(null);
    });

    // Waits for fixed amount of time, so that confetti can complete
    const b = new Promise(resolve => {
      setTimeout(() => resolve(null), 1500);
    });

    // Waits for whatever is takes longer and closes the dialog
    return Promise.all([a, b]).then(() => { 
      setBusy(false);
      setOpen(false);
    });
  }

  const onSubmit = (values: { email: string, group: string }) => {
    const { email, group } = values;

    // Because you never know what users do...
    const toMyself = 
      props.me.email === email;

    const hasInvitation = 
      props.invitations.some(i => i.email.toLowerCase() === email.toLowerCase());

    if (toMyself) {
      setError(t['You cannot send an invitation to yorself.']);
    } else if (hasInvitation) {
      setError(t['This user already has an invitation waiting.']);
    } else {
      sendInvitation(email, group).then(() =>
        formik.resetForm());
    }
  }

  const formik = useFormik({
    initialValues: { 
      email: '',
      // TODO maybe a better way to handle this?
      // Default to last in list
      group: project.groups[project.groups.length - 1].id
    },
    onSubmit
  });

  return (
    <>
      <button className="primary" onClick={() => setOpen(true)}>
        <UserPlus size={20} /> 
        <span>{t['Add a user']}</span>
      </button>

      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="dialog-overlay" />

          <Dialog.Content className="invite-users dialog-content">
            <Dialog.Title className="dialog-title">
              {t['Invite User to Project']}
            </Dialog.Title>

            <Dialog.Description className="dialog-description">
              {t['Enter e-mail and access level.']}
            </Dialog.Description>

            <form onSubmit={formik.handleSubmit}>
              <fieldset>
                <div className="field">
                  <label>{t['E-Mail']}</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    onChange={formik.handleChange}
                    value={formik.values.email}
                    required />
                </div>

                <div className="field">
                  <label>{t['Access Level']}</label>

                  <select
                    id="group" 
                    name="group" 
                    onChange={formik.handleChange} 
                    value={formik.values.group}>
                    
                    {props.project.groups.map(group => (
                      <option 
                        key={group.id}
                        value={group.id}>{t[group.name]}</option>
                    ))}
                  </select>
                </div>

                {error && (
                  <div className="error">{error}</div>
                )}
              </fieldset>

              <Button 
                busy={busy}
                confetti
                className="primary" 
                type="submit">
                <Envelope size={20} />
                <span>
                  {t['Send invitation']}
                </span>
              </Button>
            </form>

            <Dialog.Close asChild>
              <button className="dialog-close icon-only unstyled" aria-label="Close">
                <X size={16} />
              </button>
            </Dialog.Close>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  )
}