import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Context, Translations } from 'src/Types';

interface AssignmentCardActionsProps {

  i18n: Translations;

  assignment: Context;

  onEdit(): void;

  onDelete(): void;

}

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export const AssignmentCardActions = (props: AssignmentCardActionsProps) => {

  const { t } = props.i18n;

  const [open, setOpen] = useState(false);

  const stopEvent = (evt: React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
  }

  const withStopEvent = (fn: () => void) => (evt: Event | React.MouseEvent) => {
    evt.preventDefault();
    evt.stopPropagation();
    fn();
    setOpen(false);
  }

  return (
    <Root open={open} onOpenChange={setOpen}>
      <Trigger asChild>
        <button 
          className="unstyled icon-only project-card-actions"
          aria-label={`${t['Menu actions for assignment:']} ${props.assignment.name}`}>
          <DotsThreeVertical weight="bold" size={20}/>
        </button>
      </Trigger>

      <Portal>
        <Content 
          onClick={stopEvent}
          className="dropdown-content no-icons" 
          sideOffset={5} 
          align="start">
          
          <Item className="dropdown-item" onSelect={withStopEvent(props.onEdit)}>
            <PencilSimple size={16} /> <span>{t['Edit assignment']}</span>
          </Item>

          <Item className="dropdown-item" onSelect={withStopEvent(props.onDelete)}>
            <Trash size={16} /> <span>{t['Delete assignment']}</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  );

}