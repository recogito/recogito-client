import { useEffect, useState } from 'react';
import { SmileySad } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Translations } from 'src/Types';
import { Spinner } from '@components/Spinner';

import './Logout.css';

const clearCookies = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `sb-auth-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
};

export const Logout = (props: { i18n: Translations }) => {
  localStorage.removeItem('redirect-to');
  useEffect(() => {
    supabase.auth.signOut().then(() => {
      clearCookies();
      window.location.href = `/${props.i18n.lang}/sign-in`;
    });
  }, []);

  return (
    <div className='logout logout-processing'>
      <Spinner size={24} />
    </div>
  );
};
