import { isMe, type PresentUser } from '@annotorious/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@components/Avatar';
import './PresenceViewMoreButton.css';
import { CaretDown, Check } from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Trigger, RadioGroup, RadioItem, ItemIndicator } = Dropdown;


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
            {present?.slice(limit, undefined).map((presentUser) => (
                <Item className="presence-view-more-item">
                    
                    <Avatar 
                    id={presentUser.id}
                    name={presentUser.appearance.label}
                    color={presentUser.appearance.color} 
                    avatar={presentUser.appearance.avatar} />
                    <span style={{ paddingLeft: '15px' }}>
                        {presentUser.name}
                    </span>
                    
                </Item>
            ))}
        </Content>
      </Portal>
    </Root>
    );
};