import { useState, useCallback, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Envelope, X } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import type { ExtendedProjectData, MyProfile } from 'src/Types';
import papa, { type ParseResult } from 'papaparse';
import Dropzone from 'react-dropzone';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

import './InviteListOfUsersDialog.css';

export type InviteListEntry = {
  email: string;
  role: 'student' | 'admin';
};

interface InviteListOfUsersProps {

  me: MyProfile;

  project: ExtendedProjectData;

  open: boolean;

  onClose(): void;

  onError(error: string): void;

  onSend(invites: InviteListEntry[]): void;
}

export const InviteListOfUsersDialog = (props: InviteListOfUsersProps) => {
  const { t } = useTranslation(['project-collaboration', 'a11y', 'common']);

  const [csv, setCsv] = useState<InviteListEntry[] | undefined>();

  useEffect(() => {
    setCsv(undefined);
  }, [props.open]);

  const parseUsers = (users: string[][]) => {
    const validateEmail = (email: string) => {
      return email.match(
        // eslint-disable-next-line no-useless-escape
        /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
    };

    const getRole = (role: string) => {
      if (role.toLowerCase() === 'Admin'.toLowerCase()) {
        return 'admin';
      } else if (role.toLowerCase() === 'Student'.toLowerCase()) {
        return 'student';
      }

      return undefined;
    };

    const result: InviteListEntry[] = [];
    users.forEach((u) => {
      const role = getRole(u[1]);
      if (role && validateEmail(u[0])) {
        result.push({
          email: u[0],
          role,
        });
      } else {
        props.onError(`Invalid email or address: ${u[0]}, ${u[1]}`);
      }
    });

    return result;
  };

  const handleFileDropped = useCallback((acceptedFiles: File[]) => {
    const reader = new FileReader();

    reader.onabort = () => console.log('file reading was aborted');
    reader.onerror = () => console.log('file reading failed');
    reader.onload = () => {
      // Parse CSV file
      const result: ParseResult<string[]> = papa.parse(
        reader.result?.toString() as string,
        { skipEmptyLines: true }
      );
      if ((result.data || []).length > 0) {
        setCsv(parseUsers(result.data) || undefined);
      } else if (result.errors.length > 0) {
        const errors = result.errors.map((e) => e.message).join('\n');
        props.onError(errors);
      }
    };

    // read file contents
    reader.readAsText(acceptedFiles[0]);
  }, []);

  const handleSend = () => {
    if (csv) {
      props.onSend(csv);
    }
    props.onClose();
  };

  return (
    <Dialog.Root open={props.open} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <DialogContent className='invite-users dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t('Invite Users to the Project', { ns: 'project-collaboration' })}
          </Dialog.Title>

          {!csv ? (
            <Dropzone
              onDrop={(acceptedFiles) => handleFileDropped(acceptedFiles)}
              multiple={false}
              accept={{ 'text/csv': ['.csv'] }}
            >
              {({ getRootProps, getInputProps }) => (
                <section className='invite-list-section'>
                  <div {...getRootProps()}>
                    <input {...getInputProps()} />
                    <p>{t('invite-list-instructions', { ns: 'project-collaboration' })}</p>
                    <p>{t('invite-list-instructions-2', { ns: 'project-collaboration' })}</p>
                    <img
                      src='/img/invite-user-list.png'
                      alt={t('example of invite users spreadsheet', { ns: 'a11y' })}
                    />
                  </div>
                </section>
              )}
            </Dropzone>
          ) : (
            <div className='invite-table-container'>
              <h2>{t('Invitation List', { ns: 'project-collaboration' })}</h2>
              <table className='users-table'>
                <thead>
                  <tr>
                    <th>{t('E-Mail', { ns: 'common' })}</th>
                    <th>{t('Access Level', { ns: 'common' })}</th>
                  </tr>
                </thead>

                <tbody>
                  {csv!.map((user) => (
                    <tr key={user.email}>
                      <td>{user.email}</td>
                      <td>
                        {user.role === 'student'
                          ? t('Project Students', { ns: 'project-collaboration' })
                          : t('Project Admins', { ns: 'project-collaboration' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Button
            className='primary'
            type='submit'
            disabled={!csv}
            onClick={handleSend}
          >
            <Envelope size={20} />
            <span>{t('Send Invitations', { ns: 'project-collaboration' })}</span>
          </Button>

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
