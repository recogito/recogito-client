import { isMe, type PresentUser } from '@annotorious/react';
import { animated, useTransition } from '@react-spring/web';
import { Avatar } from '@components/Avatar';

import './PresenceStack.css';
import { PresenceViewMoreButton } from './PresenceViewMoreButton';

interface PresenceStackProps {

  showMe?: boolean;

  present: PresentUser[];

  limit?: number;

}

export const PresenceStack = (props: PresenceStackProps) => {

  const { limit = 5 } = props;

  const present = props.showMe ? 
    props.present : props.present.filter(u => !isMe(u));

  const transition = useTransition(present.slice(0, limit), {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }, 
    config: {
      duration: 250
    }
  });

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '50px' }}>
      <div className="presence-stack">
        <ul>
          {transition((style, presentUser) => (
            <animated.li 
              style={{ 
                ...style, 
                ...{'--presence-color': presentUser.appearance.color }
              }} 
              key={presentUser.presenceKey}>
              <Avatar 
                id={presentUser.id}
                name={presentUser.appearance.label}
                color={presentUser.appearance.color} 
                avatar={presentUser.appearance.avatar} />
            </animated.li>
          ))}
        </ul>
      </div>
      { present.length > limit && <PresenceViewMoreButton limit={limit} present={present} /> }
    </div>
  )

}