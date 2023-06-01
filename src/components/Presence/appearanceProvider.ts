import { Appearance, AppearanceProvider, PresentUser, User, defaultColorProvider } from '@annotorious/react';
import labels from './anonymous-identities.json';

const IDENTITIES = labels.map(name => `Anonymous ${name}`);

const stringToHash = (str: string) => {
  let hash = 0;
  
  for (let i=0; i<str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  return hash;
}

export const createAppearenceProvider = (): AppearanceProvider => {
  
  const colorProvider = defaultColorProvider();

  const addUser = (presenceKey: string, user: User): Appearance => {
    const color = colorProvider.assignRandomColor();

    const index = Math.abs(stringToHash(presenceKey)) % IDENTITIES.length;

    const label = IDENTITIES[index];

    const avatar = user.avatar;

    return { color, label, avatar };
  }

  const removeUser = (user: PresentUser) => {
    colorProvider.releaseColor(user.appearance.color);
  }
  
  return {
    addUser, removeUser
  }

}