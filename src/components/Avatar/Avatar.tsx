import * as RadixAvatar from '@radix-ui/react-avatar';
import { User } from '@phosphor-icons/react';

const { Root, Image, Fallback } = RadixAvatar;

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

interface AvatarProps {

  id: string;

  name?: string;

  color?: string;

  avatar?: string;

}

export const Avatar = (props: AvatarProps) => {

  const { id, name, color, avatar } = props;

  const backgroundColor = color || `hsl(${stringToHash(id) % 360}, 35%, 68%)`;

  return (
    <Root className="avatar">
      {avatar ? (
        <Image
          className="avatar-image"
          title={name} 
          src={avatar} />
      ) : (
        <Fallback 
          className="avatar-fallback"
          title={name} 
          style={{ backgroundColor }}>
          {name ? getInitials(name) : (
            <User size={16} />
          )}
        </Fallback>
      )}
    </Root>
  )

}