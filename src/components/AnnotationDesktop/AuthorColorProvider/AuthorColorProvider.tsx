import { ReactNode, createContext, useContext, useMemo } from 'react';
import { createAuthorPalette } from './authorPalette';

type AuthorColorProviderContextValue = ReturnType<typeof createAuthorPalette>;

// @ts-ignore
const AuthorColorProviderContext = createContext<AuthorColorProviderContextValue>(undefined);

interface AuthorColorProviderProps {

  children: ReactNode;

}

export const AuthorColorProvider = (props: AuthorColorProviderProps) => {

  const palette = useMemo(() => createAuthorPalette(), []);

  return (
    <AuthorColorProviderContext.Provider value={palette}>
      {props.children}
    </AuthorColorProviderContext.Provider>
  )

}

export const useAuthorPalette = () => useContext(AuthorColorProviderContext);
