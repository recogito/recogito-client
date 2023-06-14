import type { PresentUser } from '@annotorious/react';
import { animated, useTransition } from '@react-spring/web';
import { Avatar } from '@components/Avatar';

import './PresenceStack.css';

interface PresenceStackProps {

  present: PresentUser[];

}

export const PresenceStack = (props: PresenceStackProps) => {

  const transition = useTransition(props.present, {
    from: { opacity: 0 },
    enter: { opacity: 1 },
    leave: { opacity: 0 }, 
    config: {
      duration: 250
    }
  });

  return (
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
  )

}