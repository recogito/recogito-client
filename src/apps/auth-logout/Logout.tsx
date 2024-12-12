import { useEffect } from 'react';
import { supabaseImplicit } from '@backend/supabaseBrowserClient';
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
  const arr = []; // Array to hold the keys
  // Iterate over localStorage and find 'sb_
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.substring(0, 3) == 'sb_') {
      arr.push(localStorage.key(i));
    }
  }

  // Iterate over arr and remove the items by key
  for (let i = 0; i < arr.length; i++) {
    if (arr[i]) {
      localStorage.removeItem(arr[i] as string);
    }
  }
  useEffect(() => {
    supabaseImplicit.auth.signOut().then(() => {
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
