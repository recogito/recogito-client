import { LoginAccordion } from '@apps/auth-login/LoginAccordion';
import { LoginMethods } from '@apps/auth-login/methods.ts';
import { Button } from '@components/Button';
import classNames from 'classnames';
import React, { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';
import { isLoggedIn } from '@backend/auth';
import type { LoginMethod, Translations } from 'src/Types';
import { StateChecking, StateLoginForm } from './states';

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

export const Login = (props: {
  i18n: Translations;
  logo: boolean;
  methods: LoginMethod[];
}) => {
  const [isChecking, setIsChecking] = useState(true);

  const [primary, ...loginMethods] = props.methods;
  const { t } = props.i18n;

  const url = new URLSearchParams(window.location.search);
  let redirectUrl = url.get('redirect-to');
  if (redirectUrl) {
    localStorage.setItem('redirect-to', redirectUrl);
  } else {
    redirectUrl = localStorage.getItem('redirect-to');
    if (redirectUrl && redirectUrl.length === 0) {
      redirectUrl = null;
    }
  }

  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearCookies();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCookies(session);
        if (redirectUrl) {
          window.location.href = redirectUrl;
          localStorage.setItem('redirect-to', '');
        } else {
          window.location.href = `/${props.i18n.lang}/projects`;
        }
      }
    });

    isLoggedIn(supabase).then((loggedIn) => {
      if (loggedIn) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setCookies(session);
          if (redirectUrl) {
            window.location.href = redirectUrl;
            localStorage.setItem('redirect-to', '');
          } else {
            window.location.href = `/${props.i18n.lang}/projects`;
          }
        });
      } else {
        setIsChecking(false);
      }
    });
  }, []);

  const signInWithSSO = (domain: string) => {
    supabase.auth
      .signInWithSSO({
        domain: domain,
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
    supabase.auth
      .signInWithOAuth({
        provider: 'keycloak',
        options: {
          scopes: 'openid',
        },
      })
      .then(({ data, error }) => {
        if (data?.url) {
          window.location.href = data.url;
        } else {
          console.error(error);
        }
      });
  };

  const renderLoginButton = useCallback(
    (method: LoginMethod, className: string | null = null) => {
      if (method.type === LoginMethods.username_password) {
        return (
          <LoginAccordion key={method.type} label={method.name}>
            <StateLoginForm i18n={props.i18n} />
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
        <div className='login'>
          <h1>{t['Welcome Back']}</h1>
          <h2>{t['Log into your account']}</h2>
          {primary.type === LoginMethods.username_password && (
            <StateLoginForm i18n={props.i18n} />
          )}
          {primary.type !== LoginMethods.username_password &&
            renderLoginButton(primary, 'primary')}
          {loginMethods && loginMethods.map((m) => renderLoginButton(m))}
        </div>
      )}
    </div>
  );
};
