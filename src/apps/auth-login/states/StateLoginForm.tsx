import React, { useEffect, useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { TextInput } from '@components/TextInput';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Translations } from 'src/Types';
import { isValidEmail } from '../validation';

export interface StateSignInFormProps {
  i18n: Translations;
}

export const StateLoginForm = (props: StateSignInFormProps) => {
  const { t } = props.i18n;

  const [email, setEmail] = useState('');

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const onSignIn = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (!isValidEmail(email)) {
      setError(t['Please enter a valid email address']);
    } else {
      setLoading(true);
      setError('');

      supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .then(({ error }) => {
          if (error) setError(t['Invalid email or password']);
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
          label={t['Username']}
          className='lg w-full'
          onChange={setEmail}
        />

        <TextInput
          autoComplete={false}
          id='password'
          name='password'
          label={t['Password']}
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
          <a href={`/${props.i18n.lang}/forgot-password`}>
            {t['Forgot password?']}
          </a>
        </div>

        <Button
          className='primary lg w-full'
          busy={loading}
          onClick={onSignIn}
        >
          <span>{t['Sign In']}</span>
        </Button>
      </form>

    </div>
  );
};
