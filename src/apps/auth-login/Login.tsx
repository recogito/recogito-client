import { LoginAccordion } from '@apps/auth-login/LoginAccordion';
import { LoginMethods } from '@apps/auth-login/methods.ts';
import { Button } from '@components/Button';
import classNames from 'classnames';
import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';
import { isLoggedIn } from '@backend/auth';
import type { LoginMethod } from 'src/Types';
import { StateChecking, StateLoginForm } from './states';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

import './Login.css';

const setCookies = (session: Session | null) => {
  if (!session) throw 'SIGNED_IN event without session - should never happen';

  const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
  document.cookie = `sb-access-token=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
  document.cookie = `sb-refresh-token=${session?.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
};

const clearCookies = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-auth-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
};

const Login = (props: { methods: LoginMethod[] }) => {
  const [isChecking, setIsChecking] = useState(true);

  const [primary, ...loginMethods] = props.methods;
  const { t, i18n } = useTranslation(['auth-login']);

  const url = new URLSearchParams(window.location.search);
  let redirectUrl = url.get('redirect-to');
  if (redirectUrl) {
    if (redirectUrl.includes('/sign-in')) {
      // don't allow loop back to sign-in from sign-in; go to projects instead
      redirectUrl = `/${i18n.language}/projects`;
    }
    localStorage.setItem('redirect-to', redirectUrl);
  } else {
    redirectUrl = localStorage.getItem('redirect-to');
    if (redirectUrl && redirectUrl.length === 0) {
      redirectUrl = null;
    }
  }
  const next = redirectUrl || `/${i18n.language}/projects`;

  useEffect(() => {
    let isRedirecting = false;

    const performRedirect = (session: Session | null) => {
      // prevent multiple redirects race condition
      if (isRedirecting || !session) {
        return;
      }

      // set session cookies, perform the redirect
      isRedirecting = true;
      setCookies(session);
      localStorage.removeItem('redirect-to');
      window.location.replace(next);
    };

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT') {
          clearCookies();
        } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          performRedirect(session);
        }
      }
    );

    isLoggedIn(supabase).then((loggedIn) => {
      if (loggedIn) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          performRedirect(session);
        });
      } else {
        setIsChecking(false);
      }
    });

    // ensure we stop firing onAuthStateChange
    return () => authListener.subscription.unsubscribe();
  }, [next]);

  const signInWithSSO = (domain: string) => {
    const redirectTo = `${window.location.origin}/auth/callback?next=${next}`;
    supabase.auth
      .signInWithSSO({
        domain: domain,
        options: { redirectTo },
      })
      .then(({ data, error }) => {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          console.error(error);
        }
      });
  };

  const signInWithKeycloak = () => {
    window.location.href = `/${i18n.language}/keycloak?redirect-to=${next}`;
  };

  const renderLoginButton = useCallback(
    (method: LoginMethod, className: string | null = null) => {
      if (method.type === LoginMethods.username_password) {
        return (
          <LoginAccordion key={method.type} label={method.name}>
            <StateLoginForm />
          </LoginAccordion>
        );
      }

      if (method.type === LoginMethods.saml) {
        return (
          <Button
            className={classNames(className, 'lg w-full')}
            key={method.type}
            onClick={() => signInWithSSO(method.domain)}
          >
            <span>{method.name}</span>
          </Button>
        );
      }

      return (
        <Button
          className={classNames(className, 'lg w-full')}
          key={method.type}
          onClick={signInWithKeycloak}
        >
          <span>{method.name}</span>
        </Button>
      );
    },
    [signInWithKeycloak, signInWithSSO, t]
  );

  return (
    <div className='login-background-container'>
      {isChecking && <StateChecking />}
      {!isChecking && (
        <main className='login' id='main'>
          <h1 data-passed>{t('Welcome Back', { ns: 'auth-login' })}</h1>
          <h2>{t('Log into your account', { ns: 'auth-login' })}</h2>
          {primary.type === LoginMethods.username_password && (
            <StateLoginForm />
          )}
          {primary.type !== LoginMethods.username_password &&
            renderLoginButton(primary, 'primary')}
          {loginMethods && loginMethods.map((m) => renderLoginButton(m))}
        </main>
      )}
    </div>
  );
};

export const LoginApp = (props: { methods: LoginMethod[] }) => (
  <I18nextProvider i18n={clientI18next}>
    <Login {...props} />
  </I18nextProvider>
);
