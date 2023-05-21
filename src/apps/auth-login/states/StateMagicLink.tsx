import { useState } from 'react';
import { Check, WarningOctagon } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { TextInput } from '@components/TextInput';
import { Button } from '@components/Button';
import { isValidEmail } from '../validation';

export const StateMagicLink = () => {

  const [email, setEmail] = useState('');

  const [sent, setSent] = useState(false);

  const [isInvalid, setIsInvalid] = useState(false);

  const [sendError, setSendError] = useState('');

  const onSend = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (isValidEmail(email)) {
      setIsInvalid(false);

      supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: window.location.href,
        }
      }).then(({ error }) => {
        if (error) {
          setSendError(error.message);
        } else {
          setSent(true);
        }
      })
    } else {
      setIsInvalid(true);
    }
  }

  return sent ? (
    <div className="signin-magic-link sent">
      <Button 
        disabled 
        className="lg w-full success">
        <Check size={22} /> <span>Link Sent</span>
      </Button>

      <p>
        Check your email for the Magic Link.
      </p>
    </div>
  ) : (
    <div className="signin-magic-link">
      <form>
        <TextInput 
          error={isInvalid}
          className="lg w-full"
          name="email" 
          label="Your email address" 
          value={email}
          onChange={setEmail} />

        {isInvalid && (
          <p className="error">
            <WarningOctagon 
              className="icon inline" 
              size={18} weight="fill" /> Please enter a valid email address
          </p>
        )}

        {sendError && (
          <p className="error">
            <WarningOctagon 
              className="icon inline" 
              size={18} weight="fill" /> {sendError}
          </p>
        )}

        <Button type="submit" className="primary lg w-full" onClick={onSend}>Send Magic Link</Button>
      </form>
    </div>
  )

}