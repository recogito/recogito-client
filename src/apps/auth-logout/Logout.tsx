import { useEffect } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

import './Logout.css';

const clearCookies = () => {
  const expires = new Date(0).toUTCString();
  document.cookie = `sb-auth-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-access-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
  document.cookie = `sb-refresh-token=; path=/; expires=${expires}; SameSite=Lax; secure`;
};

const Logout = () => {
  const { i18n } = useTranslation([]);

  localStorage.removeItem('redirect-to');
  const arr = []; // Array to hold the keys
  // Iterate over localStorage and find 'sb_
  for (let i = 0; i < localStorage.length; i++) {
    if (localStorage.key(i)?.substring(0, 3) == 'sb-') {
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
    supabase.auth.signOut().then(() => {
      clearCookies();
      window.location.href = `/${i18n.language}/sign-in`;
    });
  }, []);

  return (
    <div className='logout logout-processing'>
      <Spinner size={24} />
    </div>
  );
};

export const LogoutApp = () => (
  <I18nextProvider i18n={clientI18next}>
    <Logout />
  </I18nextProvider>
);
