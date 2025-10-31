import { useMemo } from 'react';
import type { Appearance, AppearanceProvider, PresentUser, User } from '@annotorious/react';
import labels from './anonymous-identities.json';
import { type AuthorColors, useAuthorColors } from '@components/AnnotationDesktop';

const IDENTITIES = labels.map(name => `Anonymous ${name}`);

const stringToHash = (str: string) => {
  let hash = 0;
  
  for (let i=0; i<str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  return hash;
}

const createAppearenceProvider = (colors: AuthorColors): AppearanceProvider => {
  
  const addUser = (presenceKey: string, user: User): Appearance => {
    const color = colors.getColor(user)!;

    const label = user.name ? 
      user.name : 
      IDENTITIES[Math.abs(stringToHash(presenceKey)) % IDENTITIES.length];

    const avatar = user.avatar;

    return { color, label, avatar };
  }

  const removeUser = (_: PresentUser) => {
    // nothing to do
  }
  
  return {
    addUser, removeUser
  }

}

export const useAppearanceProvider = () => {

  const colors = useAuthorColors();
  
  return useMemo(() => createAppearenceProvider(colors), []);

}