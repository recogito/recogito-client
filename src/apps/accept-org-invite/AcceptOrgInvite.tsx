import { useState } from 'react';
import { WarningOctagon } from '@phosphor-icons/react';
import { TextInput } from '@components/TextInput';
import type { ApiAcceptOrgInvite, Translations } from 'src/Types';
import { Button } from '@components/Button';
import { supabase } from '@backend/supabaseBrowserClient';
import { AnimatedCheck } from '@components/AnimatedIcons';

import './AcceptOrgInvite.css';

interface AcceptOrgInviteProps {
  i18n: Translations;
  token: string;
}

export const AcceptOrgInviteComponent = (props: AcceptOrgInviteProps) => {
  const { t } = props.i18n;

  const [password, setPassword] = useState('');

  const [email, setEmail] = useState('');

  const [verification, setVerification] = useState('');

  const [busy, setBusy] = useState(false);

  const [error, setError] = useState('');

  const [success, setSuccess] = useState(false);

  const onAcceptOrgInvite = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (password !== verification) {
      setError(t["Passwords don't match"]);
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
          setError(t['Could not set new password']);
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
              {t['Credentials updated.']}{' '}
              <a href={`/${props.i18n.lang}/sign-in`}>{t['Login']}</a>
            </p>
          </div>
        </main>
      ) : (
        <main>
          <h1>{t['Set Password']}</h1>
          <form className='login'>
            <TextInput
              type='text'
              autoComplete={false}
              id='email'
              name='email'
              label={t['Your email address']}
              className='lg w-full'
              onChange={setEmail}
            />
            <TextInput
              type='password'
              autoComplete={false}
              id='password'
              name='password'
              label={t['Enter new password']}
              className='lg w-full'
              onChange={setPassword}
            />

            <TextInput
              type='password'
              autoComplete={false}
              id='verification'
              name='verification'
              label={t['Confirm password']}
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
              <span>{t['Set Password']}</span>
            </Button>
          </form>
        </main>
      )}
    </div>
  );
};
