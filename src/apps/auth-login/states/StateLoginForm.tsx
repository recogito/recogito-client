import React, { useEffect, useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { TextInput } from '@components/TextInput';
import { supabase } from '@backend/supabaseBrowserClient';
import { isValidEmail } from '../validation';
import { useTranslation } from 'react-i18next';

export const StateLoginForm = () => {
  const { t, i18n } = useTranslation(['auth-login']);

  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const onSignIn = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (!isValidEmail(email)) {
      setError(t('Please enter a valid email address', { ns: 'auth-login' }));
    } else {
      setLoading(true);
      setError('');

      supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .then(({ error }) => {
          if (error) setError(t('Invalid email or password', { ns: 'auth-login' }));
        })
        .finally(() => setLoading(false));
    }
  };

  useEffect(() => {
    document.getElementById('email')?.focus();
  }, []);

  return (
    <div className='login-email'>
      <form className='login'>
        <TextInput
          autoComplete={false}
          error={Boolean(error)}
          id='email'
          name='email'
          label={t('Username', { ns: 'auth-login' })}
          className='lg w-full'
          onChange={setEmail}
        />

        <TextInput
          autoComplete={false}
          id='password'
          name='password'
          label={t('Password', { ns: 'auth-login' })}
          type='password'
          className='lg w-full'
          onChange={setPassword}
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

        <div className='forgot-password'>
          <a href={`/${i18n.language}/forgot-password`}>
            {t('Forgot password?', { ns: 'auth-login' })}
          </a>
        </div>

        <Button
          className='primary lg w-full'
          busy={loading}
          onClick={onSignIn}
        >
          <span>{t('Sign In', { ns: 'auth-login' })}</span>
        </Button>
      </form>

    </div>
  );
};
