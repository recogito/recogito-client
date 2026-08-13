import { useEffect, useState } from 'react';

export const useLocalStorageBackedState = <T>(key: string, defaultValue: T) => {

  const [value, setValue] = useState<T>(() => {
    const saved = localStorage.getItem(key);

    if (saved) {
      try {
        return JSON.parse(saved) as T;
      } catch (error) {
        console.error('Error parsing stored state', error);
      }
    }

    return defaultValue;
  });

  useEffect(() => {
    if (value === undefined)
      localStorage.removeItem(key);
    else
      localStorage.setItem(key, JSON.stringify(value));
  }, [value, key]);

  return [value, setValue] as const;

}