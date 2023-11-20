import { useEffect } from 'react';
import type { RefObject } from 'react';

export const useClickOutside = (ref: RefObject<HTMLElement>, callback: () => void) => {

  const onClick = (e: MouseEvent) => {
    if (ref.current && !ref.current.contains(e.target as Node)) {
      callback();
    }
  }

  useEffect(() => {
    setTimeout(() => document.addEventListener('click', onClick), 1);

    return () => {
      document.removeEventListener('click', onClick);
    };
  });

};