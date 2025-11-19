import { useState } from 'react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Context } from 'src/Types';
import { useTranslation } from 'react-i18next';

interface AssignmentCardActionsProps {

  assignment: Context;

  onEdit(): void;

  onDelete(): void;

}

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export const AssignmentCardActions = (props: AssignmentCardActionsProps) => {

  const { t } = useTranslation(['project-assignments']);

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
          aria-label={`${t('Menu actions for assignment:', { ns: 'project-assignments' })} ${props.assignment.name}`}>
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
            <PencilSimple size={16} /> <span>{t('Edit assignment', { ns: 'project-assignments' })}</span>
          </Item>

          <Item className="dropdown-item" onSelect={withStopEvent(props.onDelete)}>
            <Trash size={16} /> <span>{t('Delete assignment', { ns: 'project-assignments' })}</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  );

}