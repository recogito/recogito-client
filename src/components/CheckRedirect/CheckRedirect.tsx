import { useEffect } from 'react';

export const CheckRedirect = () => {
  useEffect(() => {
    const redirectUrl = localStorage.getItem('redirect-to');

    if (redirectUrl && redirectUrl.length > 0) {
      localStorage.removeItem('redirect-to');
      window.location.href = redirectUrl;
    }
  }, []);

  return <div />;
};
