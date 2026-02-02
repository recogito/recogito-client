import { useEffect } from 'react';

export const CheckRedirect = () => {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const noRedirect = params.get('no-redirect');
    if (noRedirect) {
      localStorage.removeItem('redirect-to');
      return;
    }
    const redirectUrl = params.get('next') || localStorage.getItem('redirect-to');

    if (redirectUrl && redirectUrl.length > 0) {
      localStorage.removeItem('redirect-to');
      window.location.replace(redirectUrl);
    }
  }, []);

  return <div />;
};
