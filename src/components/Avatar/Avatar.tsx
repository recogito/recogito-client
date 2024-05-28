import * as RadixAvatar from '@radix-ui/react-avatar';
import { User } from '@phosphor-icons/react';
import type { UserProfile } from 'src/Types';

interface AvatarProps {
  id: string;

  name?: string;

  color?: string;

  avatar?: string;

  showBorder?: boolean;
}

export const formatName = (user: UserProfile) => {
  const { nickname, first_name, last_name } = user;

  if (nickname) return nickname;

  if (first_name || last_name) return `${first_name} ${last_name}`.trim();

  // Remember that this function returns undefined if user has no (nick)name set!
}

const stringToHash = (str: string) => {
  let hash = 0;

  for (let i = 0; i < str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  return hash;
};

const getInitials = (name: string): string => {
  const tokens = name.split(/\s+/);
  if (tokens.length === 1) {
    return tokens[0].charAt(0).toUpperCase();
  } else {
    return (
      tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)
    ).toUpperCase();
  }
};

export const Avatar = (props: AvatarProps) => {
  const { id, name, color, avatar } = props;

  const fallbackColor = `hsl(${stringToHash(id) % 360}, 35%, 48%)`;

  return (
    <RadixAvatar.Root className='avatar'>
      <span 
        className={color ? 'avatar-wrapper ring' : 'avatar-wrapper'}
        style={color ? { borderColor: color } : undefined}>
        {avatar && (
          <RadixAvatar.Image
            className='avatar-image'
            src={avatar}
          />
        )}

        <RadixAvatar.Fallback
          className='avatar-fallback'
          style={{ backgroundColor: fallbackColor }}>
          {name ? getInitials(name) : <User size={16} />}
        </RadixAvatar.Fallback>
      </span>
    </RadixAvatar.Root>
  );
};
