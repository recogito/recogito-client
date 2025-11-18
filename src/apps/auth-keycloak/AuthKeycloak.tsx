import { useEffect } from 'react';
import { supabaseImplicit } from '@backend/supabaseBrowserClient';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

const AuthKeycloak = () => {
  const { t, i18n } = useTranslation(['auth-login']);

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
    supabaseImplicit.auth
      .signInWithOAuth({
        provider: 'keycloak',
        options: {
          scopes: 'openid',
          redirectTo: redirectUrl
            ? redirectUrl
            : `/${i18n.language}/projects`,
        },
      })
      .then(({ data, error }) => {
        if (data?.url) {
          localStorage.removeItem('redirect-to');
          window.location.href = data.url;
        } else {
          console.error(error);
        }
      });
  }, []);

  return <div className='keycloak-main'>{t('Redirecting', { ns: 'auth-login' })}</div>;
};

export const AuthKeycloakApp = () => (
  <I18nextProvider i18n={clientI18next}>
    <AuthKeycloak />
  </I18nextProvider>
);