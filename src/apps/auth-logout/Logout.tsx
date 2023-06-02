import { useEffect, useState } from 'react';
import { CircleNotch, SmileySad } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Translations } from 'src/Types';

import './Logout.css';

const clearCookies = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `sb-auth-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
}

export const Logout = (props: { i18n: Translations }) => {

  const [error, setError] = useState(false);

  useEffect(() => {
    supabase.auth.signOut().then(({ error }) => {
      if (error) {
        setError(true);
      } else {
        clearCookies();
        window.location.href = `/${props.i18n.lang}/sign-in`;
      }
    });
  }, []);

  return error ? (
    <div className="logout logout-error">
      <SmileySad className="text-bottom" size={24} /> {props.i18n.t['Something went wrong.']}
    </div>
  ) : (
    <div className="logout logout-processing">
      <CircleNotch size={24} className="rotate" />
    </div>
  )

}