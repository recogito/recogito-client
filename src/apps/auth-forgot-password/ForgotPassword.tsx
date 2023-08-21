import React, { useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { TextInput } from '@components/TextInput';
import { AnimatedCheck } from '@components/AnimatedIcons';
import type { Translations } from 'src/Types';

import './ForgotPassword.css';

interface ForgotPasswordProps {

  i18n: Translations;

}

// https://stackoverflow.com/questions/46155/how-can-i-validate-an-email-address-in-javascript
export const isValidEmail = (email: string) => 
  email.toLowerCase()
    .match(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);

export const ForgotPassword = (props: ForgotPasswordProps) => {

  const { t } = props.i18n;

  const [email, setEmail] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [sent, setSent] = useState(false);

  const onRequestReset = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (isValidEmail(email)) {
      setBusy(true);

      const { origin } = window.location;
      const redirectTo = `${origin}/reset-password`;

      supabase.auth.resetPasswordForEmail(email, { redirectTo })
        .then(({ error }) => {
          if (error) {
            console.error(error);
            setError(t[error.message] || t['Something went wrong']);
          } else {
            setSent(true);
          }
  
          setBusy(false);
        });
    } else {
      setError('Please enter a valid email');
    }
  }

  return (
    <div className="forgot-password">
      {sent ? (
        <main>
          <div className="success">
            <AnimatedCheck size={38} />
            <p>
              {t['Link sent']}
            </p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t['Forgot Password?']}</h1>
          <p>
            {t['Please enter the email you use to sign in.']}
          </p>

          <form>
            <TextInput
              autoComplete={false}
              error={Boolean(error)}
              id="email"
              name="email" 
              label={t['Your email']}
              className="lg w-full" 
              onChange={setEmail} />

            {error && (
              <p className="error">
                <WarningOctagon 
                  className="icon text-bottom" 
                  size={18} weight="fill" /> {error}
              </p>
            )}

            <Button
              busy={busy}
              className="primary lg w-full"
              onClick={onRequestReset}>
              <span>{t['Request password reset']}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  )

}