import * as RadixAvatar from '@radix-ui/react-avatar';
import { User } from '@phosphor-icons/react';
import type { UserProfile } from 'src/Types';

interface AvatarProps {

  id: string;

  name?: string;

  color?: string;

  avatar?: string;

}

export const formatName = (user: UserProfile) => {
  const { nickname, first_name, last_name } = user;

  if (nickname)
    return nickname;
  
  if (first_name || last_name)
    return `${first_name} ${last_name}`.trim();

  // Remember that this function returns undefined if user has no (nick)name set!
}

export const getDisplayName = (user: UserProfile) => {
  if (user.nickname)
    return user.nickname;

  const realname = [user.first_name, user.last_name].filter(str => str).join(' ');

}

const stringToHash = (str: string) => {
  let hash = 0;
  
  for (let i=0; i<str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  return hash;
}

const getInitials = (name: string): string => {
  const tokens = name.split(/\s+/);
  if (tokens.length === 1) {
    return tokens[0].charAt(0).toUpperCase();
  } else {
    return (tokens[0].charAt(0) + tokens[tokens.length - 1].charAt(0)).toUpperCase();
  }
}



export const Avatar = (props: AvatarProps) => {

  const { id, name, color, avatar } = props;

  const backgroundColor = color || `hsl(${stringToHash(id) % 360}, 35%, 68%)`;

  return (
    <RadixAvatar.Root className="avatar">
      {avatar && (
        <RadixAvatar.Image
          className="avatar-image"
          title={`${name} avatar`} 
          src={avatar} />
      )}
      
      <RadixAvatar.Fallback 
        className="avatar-fallback"
        title={`${name} avatar image`} 
        style={{ backgroundColor }}>
        {name ? getInitials(name) : (
          <User size={16} />
        )}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  )

}