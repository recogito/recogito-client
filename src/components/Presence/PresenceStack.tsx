import { isMe, type PresentUser } from '@annotorious/react';
import { animated, useTransition } from '@react-spring/web';
import { Avatar } from '@components/Avatar';

import './PresenceStack.css';

interface PresenceStackProps {

  showMe?: boolean;

  present: PresentUser[];

  limit?: number;

}

export const PresenceStack = (props: PresenceStackProps) => {
  console.log(props.present);

  const { limit = 3 } = props;

  const present = props.showMe ? 
    props.present : props.present.filter(u => !isMe(u));

  const displayList = present.length <= limit ? present : [ ...present.slice(0, limit), { presenceKey: '0', presentList: present.slice(limit+1, undefined), appearance: { label: `+ ${present.length - limit} more`, color: 'white' } }];
  console.log(displayList);
  const transition = useTransition(displayList, {
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
            {presentUser.presenceKey != '0' ? <Avatar 
              id={presentUser.id}
              name={presentUser.appearance.label}
              color={presentUser.appearance.color} 
              avatar={presentUser.appearance.avatar} /> : <></>}
          </animated.li>
        ))}
      </ul>
    </div>
  )

}