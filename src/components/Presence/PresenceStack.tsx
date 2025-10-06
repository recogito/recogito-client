import { isMe } from '@recogito/annotorious-supabase';
import type { PresentUser } from '@annotorious/react';
import { animated, useTransition } from '@react-spring/web';
import * as Popover from '@radix-ui/react-popover';
import * as Tooltip from '@radix-ui/react-tooltip';
import { getDisplayName } from '@components/AnnotationDesktop';
import { Avatar } from '@components/Avatar';

import './PresenceStack.css';

interface PresenceStackProps {

  showMe?: boolean;

  present: PresentUser[];

  limit?: number;

}

export const PresenceStack = (props: PresenceStackProps) => {

  const limit = props.limit || 4;

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

      <div className="presence">
        <ul className="presence-stack">
          {transition((style, presentUser) => (
            <animated.li 
              style={{ 
                ...style, 
                ...{'--presence-color': presentUser.appearance.color }
              }} 
              key={presentUser.presenceKey}>
              <Tooltip.Provider>
                <Tooltip.Root delayDuration={100}>
                  <Tooltip.Trigger>
                    <Avatar 
                      id={presentUser.id}
                      name={presentUser.appearance.label}
                      color={presentUser.appearance.color} 
                      avatar={presentUser.appearance.avatar} />
                  </Tooltip.Trigger>

                  <Tooltip.Content 
                    className="tooltip-content"
                    side="bottom">
                    {getDisplayName(presentUser)}
                  </Tooltip.Content>
                </Tooltip.Root>
              </Tooltip.Provider>
            </animated.li>
          ))}
        </ul>

        {present.length > limit && (
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="presence-more">
                +{present.length - limit}
              </button>
            </Popover.Trigger>

            <Popover.Content 
              className="popover-content presence-list"
              align="end"
              alignOffset={-10}
              sideOffset={5}>
              <ul>
                {present.map(user => (
                  <li key={user.id}>
                    <Avatar
                      id={user.id}
                      name={user.appearance.label}
                      color={user.appearance.color} 
                      avatar={user.appearance.avatar}
                    />
                    <span>{getDisplayName(user)}</span>
                  </li>                  
                ))}
              </ul>
            </Popover.Content>
          </Popover.Root>
        )}
      </div>

  )

}