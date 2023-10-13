import { useEffect, useState } from "react";
import { Lock, MagicWand, WarningOctagon } from "@phosphor-icons/react";
import { Button } from "@components/Button";
import { TextInput } from "@components/TextInput";
import { supabase } from "@backend/supabaseBrowserClient";
import type { Translations } from "src/Types";
import { isValidEmail } from "../validation";

export interface StateSignInFormProps {
  i18n: Translations;

  onSendLink(): void;

  onSignInWithSSO(domain: string): void;
}

export const StateLoginForm = (props: StateSignInFormProps) => {
  const { t } = props.i18n;

  const [email, setEmail] = useState("");

  const [loading, setLoading] = useState(false);

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onSignIn = (evt: React.MouseEvent) => {
    evt.preventDefault();

    setLoading(true);

    if (!isValidEmail(email)) {
      setError(t["Please enter a valid email address"]);
    } else {
      setError("");

      supabase.auth
        .signInWithPassword({
          email,
          password,
        })
        .then(({ error }) => {
          if (error) setError(t["Invalid email or password"]);
        });
    }
  };

  useEffect(() => {
    document.getElementById("email")?.focus();
  }, []);

  return (
    <div className='login'>
      <main>
        <h1>{t["Welcome Back"]}</h1>
        <p>{t["Log into your account"]}</p>

        <div className='login-email'>
          <form>
            <TextInput
              autoComplete={false}
              error={Boolean(error)}
              id='email'
              name='email'
              label={t["Email"]}
              className='lg w-full'
              onChange={setEmail}
            />

            <TextInput
              autoComplete={false}
              id='password'
              name='password'
              label={t["Password"]}
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
                />{" "}
                {error}
              </p>
            )}

            <Button
              className='primary lg w-full'
              busy={loading}
              onClick={onSignIn}
            >
              <span>{t["Sign In"]}</span>
            </Button>
          </form>

          <div className='forgot-password'>
            <a href={`/${props.i18n.lang}/forgot-password`}>
              {t["Forgot password?"]}
            </a>
          </div>
        </div>
      </main>

      <footer>
        <p>
          {t["Don't have an account?"]} <a href='#'>{t["Sign up now."]}</a>
        </p>
      </footer>
    </div>
  );
};
