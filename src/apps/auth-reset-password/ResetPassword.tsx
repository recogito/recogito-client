import { useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import { WarningOctagon } from '@phosphor-icons/react';
import { TextInput } from '@components/TextInput';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { AnimatedCheck } from '@components/AnimatedIcons';

import './ResetPassword.css';
import clientI18next from 'src/i18n/client';

const ResetPassword = () => {
  const { t, i18n } = useTranslation(['auth-reset-password']);

  const [password, setPassword] = useState('');

  const [verification, setVerification] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const onResetPassword = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (password !== verification) {
      setError(t("Passwords don't match", { ns: 'auth-reset-password' }));
    } else {
      setBusy(true);
      supabase.auth.updateUser({ password }).then(({ error }) => {
        if (error) {
          console.error(error);
          setError(t('Could not reset password', { ns: 'auth-reset-password' }));
        } else {
          setSuccess(true);
        }
        setBusy(false);
      });
    }
  };

  return (
    <div className='reset-password'>
      {success ? (
        <main>
          <div className='success'>
            <AnimatedCheck size={38} />
            <p>
              {t('Password reset.', { ns: 'auth-reset-password' })}{' '}
              <a href={`/${i18n.language}/projects`}>
                {t('Go to dashboard.', { ns: 'auth-reset-password' })}
              </a>
            </p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t('Set Password', { ns: 'auth-reset-password' })}</h1>
          <form className='login'>
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
              onClick={onResetPassword}
            >
              <span>{t('Set Password', { ns: 'auth-reset-password' })}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  );
};

export const ResetPasswordWrapper = () => (
  <I18nextProvider i18n={clientI18next}>
    <ResetPassword />
  </I18nextProvider>
);