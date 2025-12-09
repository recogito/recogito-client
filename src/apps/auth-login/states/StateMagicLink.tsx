import { useState } from 'react';
import { Check, WarningOctagon } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { TextInput } from '@components/TextInput';
import { Button } from '@components/Button';
import { isValidEmail } from '../validation';
import { useTranslation } from 'react-i18next';

type ButtonStatus = 'idle' | 'fetching' | 'sent';

export const StateMagicLink = () => {

  const { t } = useTranslation(['auth-login']);

  const [email, setEmail] = useState('');

  const [status, setStatus] = useState<ButtonStatus>('idle');

  const [isInvalid, setIsInvalid] = useState(false);

  const [sendError, setSendError] = useState('');

  const onSend = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (status !== 'idle') 
      return;

    if (isValidEmail(email)) {
      setIsInvalid(false);

      setStatus('fetching');

      supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href,
        }
      }).then(({ error }) => {
        if (error) {
          setSendError(error.message);
        } else {
          setStatus('sent');
        }
      })
    } else {
      setIsInvalid(true);
    }
  }

  return (status === 'sent') ? (
    <div className="login-magic-link sent">
      <Button 
        disabled
        className="lg w-full success">
        <Check size={22} /> <span>{t('Link Sent', { ns: 'auth-login' })}</span>
      </Button>

      <p>
        {t('Check your email for the Magic Link.', { ns: 'auth-login' })}
      </p>
    </div>
  ) : (
    <div className="login-magic-link">
      <form>
        <TextInput 
          autoComplete={false}
          error={isInvalid}
          className="lg w-full"
          name="email" 
          label={t('Your email address', { ns: 'auth-login' })}
          value={email}
          onChange={setEmail} />

        {isInvalid && (
          <p className="error">
            <WarningOctagon 
              className="icon text-bottom" 
              size={18} weight="fill" /> {t('Please enter a valid email address', { ns: 'auth-login' })}
          </p>
        )}

        {sendError && (
          <p className="error">
            <WarningOctagon 
              className="icon inline" 
              size={18} weight="fill" /> {sendError}
          </p>
        )}

        <Button
          busy={status === 'fetching'}
          type="submit" 
          className="primary lg w-full" 
          onClick={onSend}>
          <span>{t('Send Magic Link', { ns: 'auth-login' })}</span>
        </Button>
      </form>
    </div>
  )

}