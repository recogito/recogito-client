import React, { useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { TextInput } from '@components/TextInput';
import { AnimatedCheck } from '@components/AnimatedIcons';
import { I18nextProvider, useTranslation } from 'react-i18next';

import './ForgotPassword.css';
import clientI18next from 'src/i18n/client';

// https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
export const isValidEmail = (email: string) =>
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );

const ForgotPassword = () => {
  const { t } = useTranslation(['auth-forgot-password']);

  const [email, setEmail] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [sent, setSent] = useState(false);

  const onRequestReset = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (isValidEmail(email)) {
      setBusy(true);

      const host =
        window.location.port !== ''
          ? `${window.location.protocol}//${window.location.hostname}:${window.location.port}`
          : `${window.location.protocol}//${window.location.hostname}`;
      const redirectTo = `${host}/reset-password`;

      supabase.auth
        .resetPasswordForEmail(email, { redirectTo })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setError(t('Something went wrong', { ns: 'auth-forgot-password' }));
          } else {
            setSent(true);
          }

          setBusy(false);
        });
    } else {
      setError('Please enter a valid email');
    }
  };

  return (
    <div className='forgot-password'>
      {sent ? (
        <main>
          <div className='success'>
            <AnimatedCheck size={38} />
            <p>{t('Link sent', { ns: 'auth-forgot-password' })}</p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t('Forgot Password?', { ns: 'auth-forgot-password' })}</h1>
          <p>{t('Please enter the email you use to sign in.', { ns: 'auth-forgot-password' })}</p>

          <form className='login'>
            <TextInput
              autoComplete={false}
              error={Boolean(error)}
              id='email'
              name='email'
              label={t('Your email', { ns: 'auth-forgot-password' })}
              className='lg w-full'
              onChange={setEmail}
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
              onClick={onRequestReset}
            >
              <span>{t('Request password reset', { ns: 'auth-forgot-password' })}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  );
};

export const ForgotPasswordWrapper = () => (
  <I18nextProvider i18n={clientI18next}>
    <ForgotPassword />
  </I18nextProvider>
);
