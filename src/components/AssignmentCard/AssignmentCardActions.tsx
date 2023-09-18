import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

interface AssignmentCardActionsProps {

  i18n: Translations;

  onDelete(): void;

}

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export const AssignmentCardActions = (props: AssignmentCardActionsProps) => {

  const stopEvent = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  const withStopEvent = (fn: Function) => (evt: Event | React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    fn();
  }

  return (
    <Root>
      <Trigger asChild>
        <button className="unstyled icon-only project-card-actions">
          <DotsThreeVertical weight="bold" size={20}/>
        </button>
      </Trigger>

      <Portal>
        <Content 
          onClick={stopEvent}
          className="dropdown-content no-icons" 
          sideOffset={5} 
          align="start">
          <Item className="dropdown-item" onSelect={withStopEvent(props.onDelete)}>
            <Trash size={16} /> <span>Delete assignment</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  );

}