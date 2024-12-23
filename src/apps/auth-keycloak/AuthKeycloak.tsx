import { useEffect } from 'react';
import type { Translations } from 'src/Types';
import { supabaseImplicit } from '@backend/supabaseBrowserClient';

interface AuthKeycloakProps {
  i18n: Translations;
}
export const AuthKeycloak = (props: AuthKeycloakProps) => {
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
    supabaseImplicit.auth
      .signInWithOAuth({
        provider: 'keycloak',
        options: {
          scopes: 'openid',
          redirectTo: redirectUrl
            ? redirectUrl
            : `/${props.i18n.lang}/projects`,
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

  return <div className='keycloak-main'>{t['Redirecting']}</div>;
};
