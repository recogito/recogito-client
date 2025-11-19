import * as Dialog from '@radix-ui/react-dialog';
import { X, User } from '@phosphor-icons/react';
import './InviteUserDialog.css';
import { useState } from 'react';
import { DialogContent } from '@components/DialogContent';
import { useTranslation } from 'react-i18next';

interface InviteUserDialogProps {

  onSave(email: string): void;
}

export const InviteUserDialog = (props: InviteUserDialogProps) => {
  const { t } = useTranslation(['user-management', 'a11y']);

  const [email, setEmail] = useState('');

  const validateEmail = (email: string) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button className='invite-user-button primary'>
          <User />
          {t('Invite User', { ns: 'user-management' })}
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />
        <DialogContent className='dialog-content'>
          <Dialog.Title className='dialog-title'>
            {t('Invite User', { ns: 'user-management' })}
          </Dialog.Title>
          <Dialog.Description className='dialog-description'>
            {
              t('Invite a user to join your organization. They will be sent an email that will allow them to confirm account details.', { ns: 'user-management' })
            }
          </Dialog.Description>
          <fieldset className='invite-user-fieldset'>
            <label
              className='invite-user-label'
              htmlFor='email'
              aria-label={t('enter user email', { ns: 'a11y' })}
            >
              {t('Email', { ns: 'user-management' })}
            </label>
            <input
              className='invite-user-input'
              id='email'
              type='email'
              onChange={(e) => setEmail(e.target.value)}
            />
          </fieldset>
          <div
            style={{
              display: 'flex',
              marginTop: 25,
              justifyContent: 'flex-end',
            }}
          >
            <Dialog.Close asChild>
              <button
                className='invite-user-button primary'
                disabled={email.length === 0 || !validateEmail(email)}
                onClick={() => props.onSave(email)}
              >
                {t('Invite', { ns: 'user-management' })}
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Close asChild>
            <button className='invite-user-icon-button' aria-label={t('close', { ns: 'a11y' })}>
              <X size={18} />
            </button>
          </Dialog.Close>
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
