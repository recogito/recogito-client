import { isMe } from '@annotorious/react';
import type { PresentUser } from '@annotorious/react';
import * as Popover from '@radix-ui/react-popover';
import { Avatar } from '@components/Avatar';
import './PresenceViewMoreButton.css';
import { CaretDown } from '@phosphor-icons/react';

const { Content, Portal, Root, Trigger } = Popover;

interface PresenceViewMoreButtonProps {

    present?: PresentUser[];

    limit?: number;

    showMe?: boolean;

}

export const PresenceViewMoreButton = (props: PresenceViewMoreButtonProps) => {
  const { limit = 3 } = props;
    
  const present = props.showMe ? 
    props.present : props.present?.filter(u => !isMe(u));

    return (
    <Root>
      <Trigger asChild>
        <button
          className="presence-view-more-trigger">
          <span>
            +{present ? present.length - limit : '0'} more
          </span>   
          <CaretDown size={10} weight="bold" />
        </button>
      </Trigger>

      <Portal>
        <Content align="start" className="presence-view-more-content">
          <ul>
            {present?.map((presentUser) => (
                <li className="presence-view-more-item">
                    
                    <Avatar 
                    id={presentUser.id}
                    name={presentUser.appearance.label}
                    color={presentUser.appearance.color} 
                    avatar={presentUser.appearance.avatar} />
                    <span style={{ paddingLeft: '15px' }}>
                        {presentUser.name}
                    </span>
                    
                </li>
            ))}
            </ul>
        </Content>
      </Portal>
    </Root>
    );
};