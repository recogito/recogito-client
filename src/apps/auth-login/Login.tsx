import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';
import { isLoggedIn } from '@backend/auth';
import type { LoginMethod, Translations } from 'src/Types';
import { StateChecking, StateLoginForm, StateMagicLink } from './states';
import { LoginMethodSelector } from '@apps/auth-login/LoginMethodSelector';

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
  splashURL: string;
  methods: LoginMethod[];
}) => {
  const [isChecking, setIsChecking] = useState(true);

  const [sendLink, setSendLink] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  const [currentMethod, setCurrentMethod] = useState<LoginMethod | undefined>();

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

  const onMethodChanged = (method: LoginMethod) => {
    setCurrentMethod(method);
    if (method.type === 'username_password') {
      setShowLogin(true);
      setSendLink(false);
    } else if (method.type === 'magic_link') {
      setSendLink(true);
      setShowLogin(false);
    } else if (method.type === 'saml') {
      setSendLink(false);
      setShowLogin(false);
      signInWithSSO(method.domain);
    } else if (method.type === 'keycloak') {
      setSendLink(false);
      setShowLogin(false);
      signInWithKeycloak();
    }
  };

  if (isChecking) {
    return (
      <div className='login-background-container'>
        <img src={props.splashURL} alt={'Image of site'} width='100%' height='100%' />
        <StateChecking />
      </div>
    )
  } else if (sendLink) {
    return (
      <div className='login-background-container'>
        <img src={props.splashURL} alt={'Image of site'} width='100%' height='100%' />
        <div className='login-selector'>
          <LoginMethodSelector
            i18n={props.i18n}
            availableMethods={props.methods}
            currentMethod={currentMethod}
            onChangeMethod={onMethodChanged}
          />
        </div>
        <StateMagicLink i18n={props.i18n} />;
      </div>
    );
  } else if (showLogin) {
    return (
      <div className='login-background-container'>
        <img src={props.splashURL} alt={'Image of site'} width='100%' height='100%' />
        <div className='login-selector'>
          <LoginMethodSelector
            i18n={props.i18n}
            availableMethods={props.methods}
            currentMethod={currentMethod}
            onChangeMethod={onMethodChanged}
          />
        </div>
        <StateLoginForm
          i18n={props.i18n}
          onSendLink={() => setSendLink(true)}
          onSignInWithSSO={signInWithSSO}
        />
      </div>
    );
  } else {
    return (
      <div className='login-background-container'>
        <img src={props.splashURL} alt={'Image of site'} width='100%' height='100%' />
        <div className='login-selector'>
          <LoginMethodSelector
            i18n={props.i18n}
            availableMethods={props.methods}
            currentMethod={currentMethod}
            onChangeMethod={onMethodChanged}
          />
        </div>
      </div>
    );
  }
};
