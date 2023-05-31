import * as RadixAvatar from '@radix-ui/react-avatar';
import type { UserProfile } from 'src/Types';
import { ANONYMOUS_IDENTIES } from './AnonymousIdentities';

import './Avatar.css';

const { Root, Image, Fallback } = RadixAvatar;

const stringToHash = (str: string) => {
  let hash = 0;
  
  for (let i=0; i<str.length; i++)
    hash = str.charCodeAt(i) + ((hash << 5) - hash);

  return hash;
}

export const Avatar = (props: { user: UserProfile}) => {

  const { nickname, avatar_url} = props.user;

  const hash = stringToHash(props.user.id);

  console.log('hash', hash);

  const hue = hash % 360;

  const index = Math.abs(hash) % ANONYMOUS_IDENTIES.length;

  console.log(index, ANONYMOUS_IDENTIES.length);

  return (
    <Root className="avatar">
      {avatar_url ? (
        <Image
          className="avatar-image"
          src={avatar_url}
          alt={nickname || ANONYMOUS_IDENTIES[index]} />
      ) : (
        <Fallback 
          className="avatar-fallback"
          title={nickname || ANONYMOUS_IDENTIES[index]} 
          style={{
            backgroundColor: `hsl(${hue}, 35%, 54%)`
          }}>
          <div 
            className="avatar-fallback-inner"
            style={{ 
              background: `radial-gradient(hsl(${hue}, 35%, 78%), hsl(${hue}, 35%, 67%))`,
              backgroundColor: `hsl(${hue}, 35%, 78%)`,
            }}>
            {ANONYMOUS_IDENTIES[index].charAt(0)}
          </div>
        </Fallback>
      )}
    </Root>
  )

}