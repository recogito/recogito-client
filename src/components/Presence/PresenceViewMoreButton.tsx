import { isMe, type PresentUser } from '@annotorious/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Avatar } from '@components/Avatar';
import './PresenceViewMoreButton.css';
import { CaretDown, Check } from '@phosphor-icons/react';

const { Content, Item, Portal, Root, Trigger, RadioGroup, RadioItem, ItemIndicator } = Dropdown;


interface PresenceViewMoreButtonProps {

    present: PresentUser[];

    limit?: number;

    showMe?: boolean;

}

export const PresenceViewMoreButton = (props: PresenceViewMoreButtonProps) => {
  const { limit = 3 } = props;
    
  const present = props.showMe ? 
    props.present : props.present.filter(u => !isMe(u));

    return (
    <Root>
      <Trigger asChild>
        <button
          className="presence-view-more-trigger">
          <span>
            +{present.length - limit} more
          </span>   
          <CaretDown size={10} weight="bold" />
        </button>
      </Trigger>


        <Content>
          <Item>hi</Item>
          <Item>bye</Item>
        </Content>

    </Root>
    );
};