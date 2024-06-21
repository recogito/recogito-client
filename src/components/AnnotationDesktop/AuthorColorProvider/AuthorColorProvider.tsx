import { type ReactNode, createContext, useContext, useMemo } from 'react';
import { type AuthorColors, createAuthorPalette } from './AuthorColors';

// @ts-ignore
const AuthorColorProviderContext = createContext<AuthorColors>(undefined);

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

export const useAuthorColors = () => useContext(AuthorColorProviderContext);
