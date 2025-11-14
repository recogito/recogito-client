import { useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { TextInput } from '@components/TextInput';
import type { ApiAcceptOrgInvite } from 'src/Types';
import { Button } from '@components/Button';
import { AnimatedCheck } from '@components/AnimatedIcons';
import { I18nextProvider, useTranslation } from 'react-i18next';

import './AcceptOrgInvite.css';
import clientI18next from 'src/i18n/client';

interface AcceptOrgInviteProps {
  token: string;
}

const AcceptOrgInviteComponent = (props: AcceptOrgInviteProps) => {
  const { t, i18n } = useTranslation(['auth-reset-password']);

  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');

  const [verification, setVerification] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const onAcceptOrgInvite = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (password !== verification) {
      setError(t("Passwords don't match", { ns: 'auth-reset-password' }));
    } else {
      setBusy(true);

      const payload: ApiAcceptOrgInvite = {
        email,
        password,
        token: props.token,
      };

      console.log(props.token);

      fetch('/api/accept-new-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      }).then((response) => {
        if (!response.ok) {
          console.error(response.status);
          setError(
            t('Could not set new password', { ns: 'auth-reset-password' })
          );
        } else {
          setSuccess(true);
        }
        setBusy(false);
      });
    }
  };

  return (
    <div className='accept-org-invite'>
      {success ? (
        <main>
          <div className='success'>
            <AnimatedCheck size={38} />
            <p>
              {t('Credentials updated.', { ns: 'auth-reset-password' })}{' '}
              <a href={`/${i18n.language}/sign-in`}>
                {t('Login', { ns: 'auth-reset-password' })}
              </a>
            </p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t('Set Password', { ns: 'auth-reset-password' })}</h1>
          <form className='login'>
            <TextInput
              type='text'
              autoComplete={false}
              id='email'
              name='email'
              label={t('Your email address', { ns: 'auth-reset-password' })}
              className='lg w-full'
              onChange={setEmail}
            />
            <TextInput
              type='password'
              autoComplete={false}
              id='password'
              name='password'
              label={t('Enter new password', { ns: 'auth-reset-password' })}
              className='lg w-full'
              onChange={setPassword}
            />

            <TextInput
              type='password'
              autoComplete={false}
              id='verification'
              name='verification'
              label={t('Confirm password', { ns: 'auth-reset-password' })}
              className='lg w-full'
              error={Boolean(error)}
              onChange={setVerification}
            />

            {error && (
              <p className='error'>
                <WarningOctagon
                  className='icon text-bottom'
                  size={18}
                  weight='fill'
                />{' '}
                {error}
              </p>
            )}

            <Button
              busy={busy}
              className='primary lg w-full'
              onClick={onAcceptOrgInvite}
            >
              <span>{t('Set Password', { ns: 'auth-reset-password' })}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  );
};


export const AcceptOrgInviteWrapper = (props: AcceptOrgInviteProps) => (
  <I18nextProvider i18n={clientI18next}>
    <AcceptOrgInviteComponent {...props} />
  </I18nextProvider>
);