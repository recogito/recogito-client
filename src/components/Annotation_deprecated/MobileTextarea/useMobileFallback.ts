import { useCallback, useEffect, useState } from 'react';

const MIN_SCREEN_HEIGHT = 512;

export const useMobileFallback = () => {

  const [useMobile, setUseMobile] = useState(false);

  const onResize = useCallback(() => {
    const h = window.visualViewport?.height || window.screen.height;
    setUseMobile(h < MIN_SCREEN_HEIGHT);
  }, []);

  useEffect(() => {
    return () => {
      // Quill doesn't seem to fire onBlur reliably!
      window.visualViewport?.removeEventListener('resize', onResize);
    }
  }, []);

  const onFocus = () => {
    onResize();
    window.visualViewport?.addEventListener('resize', onResize);
  }

  const onBlur = () => {
    window.visualViewport?.removeEventListener('resize', onResize);
  }

  const onClose = () => {
    window.visualViewport?.removeEventListener('resize', onResize);
    setUseMobile(false);
  }

  return { 
    onBlur,
    onClose,
    onFocus,
    useMobile
  };

}