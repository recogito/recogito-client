import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@backend/supabaseBrowserClient';
import { isLoggedIn } from '@backend/auth';
import type { Translations } from 'src/Types';
import { StateChecking, StateLoginForm, StateMagicLink } from './states';

import './Login.css';

const setCookies = (session: Session | null) => {
  if (!session)
    throw 'SIGNED_IN event without session - should never happen';
  
  const maxAge = 100 * 365 * 24 * 60 * 60; // 100 years, never expires
  document.cookie = `access-token=${session?.access_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
  document.cookie = `refresh-token=${session?.refresh_token}; path=/; max-age=${maxAge}; SameSite=Lax; secure`;
}

const clearCookies = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `auth-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
}

export const Login = (props: { i18n: Translations }) => {

  const [isChecking, setIsChecking] = useState(true);

  const [sendLink, setSendLink] = useState(false);
  
  useEffect(() => {
    supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        clearCookies();
      } else if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        setCookies(session);
        window.location.href = '../projects';
      }
    });
    
    isLoggedIn(supabase).then(loggedIn => {
      if (loggedIn) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          setCookies(session);
          window.location.href = '../projects';
        })
      } else {
        setIsChecking(false);
      }
    });
  }, []);

  if (isChecking) {
    return (
      <StateChecking />
    )
  } else if (sendLink) {
    return (
      <StateMagicLink i18n={props.i18n} />
    );
  } else {
    return (
      <StateLoginForm 
        i18n={props.i18n}
        onSendLink={() => setSendLink(true)} />
    )
  }

}