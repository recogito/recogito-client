import { useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { TextInput } from '@components/TextInput';
import type { Translations } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { AnimatedCheck } from '@components/AnimatedIcons';

import './ResetPassword.css';

interface ResetPasswordProps {

  i18n: Translations;

}

export const ResetPassword = (props: ResetPasswordProps) => {

  const { t } = props.i18n;

  const [password, setPassword] = useState('');

  const [verification, setVerification] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const onResetPassword = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (password !== verification) {
      setError(t['Passwords don\'t match']);
    } else {
      setBusy(true);

      supabase.auth.updateUser({ password }).then(({ error }) => {
        if (error) {
          console.error(error);
          setError(t[error.message] || t['Could not reset password']);
        } else {
          setSuccess(true);
        }

        setBusy(false);
      });
    }
  }

  return (
    <div className="reset-password">
      {success ? (
        <main>
          <div className="success">
            <AnimatedCheck size={38} />
            <p>
              {t['Password reset.']} <a href={`/${props.i18n.lang}/projects`}>{t['Go to dashboard.']}</a>
            </p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t['Reset Password']}</h1>

          <form>
            <TextInput
              type="password"
              autoComplete={false}
              id="password"
              name="password" 
              label={t['Enter new password']}
              className="lg w-full" 
              onChange={setPassword} />
            
            <TextInput
              type="password"
              autoComplete={false}
              id="verification"
              name="verification" 
              label={t['Confirm password']}
              className="lg w-full" 
              error={Boolean(error)}
              onChange={setVerification} />

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
              onClick={onResetPassword}>
              <span>{t['Reset Password']}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  );

}