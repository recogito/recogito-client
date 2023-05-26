import { useState } from 'react';
import { Lock, MagicWand, WarningOctagon } from '@phosphor-icons/react';
import { Button } from '@components/Button';
import { TextInput } from '@components/TextInput';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Translations } from 'src/Types';
import { isValidEmail } from '../validation';

export interface StateSignInFormProps {

  i18n: Translations;

  onSendLink(): void;

}

export const StateLoginForm = (props: StateSignInFormProps) => {

  const { t } = props.i18n;

  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');

  const [error, setError] = useState('');

  const onSignIn = (evt: React.MouseEvent) => {
    evt.preventDefault();

    if (!isValidEmail(email)) {
      setError(t['Please enter a valid email address']);
    } else {
      setError('');
      
      supabase.auth.signInWithPassword({
        email, password
      }).then(({ error }) => {
        if (error)
          setError(t['Invalid email or password']);
      });
    }
  }

  return (
    <div className="login">
      <main>
        <h1>{t['Welcome Back']}</h1>
        <p>
          {t['Log into your account']}
        </p>
    
        <div className="login-email">
          <form>
            <TextInput
              autoComplete={false}
              error={Boolean(error)}
              name="email" 
              label={t['Email']} 
              className="lg w-full" 
              onChange={setEmail} />

            <TextInput 
              autoComplete={false}
              name="password" 
              label={t['Password']} 
              type="password"
              className="lg w-full" 
              onChange={setPassword} />

            {error && (
              <p className="error">
                <WarningOctagon className="icon inline" size={18} weight="fill" /> {error}
              </p>
            )}

            <Button   
              className="primary lg w-full"
              onClick={onSignIn}>{t['Sign In']}</Button>
          </form>

          <div className="forgot-password">
            <a href="#">{t['Forgot password?']}</a>
          </div>
        </div>

        <div className="login-separator">
          <span>{t['OR']}</span>
        </div>

        <div className="login-providers">
          <button className="lg w-full" onClick={props.onSendLink}>
            <MagicWand size={19} /> {t['Continue with Magic Link']}
          </button>

          <button className="lg w-full">
            <Lock size={19} /> {t['Continue with SSO']}
          </button>
        </div>
      </main>

      <footer>
        <p>
          {t['Don\'t have an account?']} <a href="#">{t['Sign up now.']}</a>  
        </p>
      </footer>
    </div>
  )


}