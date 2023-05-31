import * as RadixAvatar from '@radix-ui/react-avatar';
import type { UserProfile } from 'src/Types';
import { ANONYMOUS_IDENTITIES } from '../PresenceStack/AnonymousIdentities';

import './Avatar.css';

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

  user: UserProfile;

  color?: string;

}

export const Avatar = (props: AvatarProps) => {

  const { nickname, avatar_url} = props.user;

  const hash = stringToHash(props.user.id);

  const backgroundColor = props.color || `hsl(${hash % 360}, 35%, 78%)`;

  const index = Math.abs(hash) % ANONYMOUS_IDENTITIES.length;

  return (
    <Root className="avatar">
      {avatar_url ? (
        <Image
          className="avatar-image"
          src={avatar_url}
          alt={nickname || ANONYMOUS_IDENTITIES[index]} />
      ) : (
        <Fallback 
          className="avatar-fallback"
          title={nickname || ANONYMOUS_IDENTITIES[index]} 
          style={{ backgroundColor }}>
          {getInitials(ANONYMOUS_IDENTITIES[index])}
        </Fallback>
      )}
    </Root>
  )

}