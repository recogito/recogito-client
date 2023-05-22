import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export interface ProjectCardActionsMenuProps {

  i18n: Translations

  onDelete(): void;

  onRename(): void;

}

export const ProjectCardActionsMenu = (props: ProjectCardActionsMenuProps) => {

  const { i18n } = props;

  return (
    <Root>
      <Trigger asChild>
        <button className="unstyled icon-only">
          <DotsThreeVertical weight="bold" size={20}/>
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content no-icons" sideOffset={5} align="start">
          <Item className="dropdown-item" onSelect={props.onDelete}>
            <Trash size={16} /> <span>{i18n['Delete project']}</span>
          </Item>

          <Item className="dropdown-item" onSelect={props.onRename}>
            <PencilSimple size={16} /> <span>{i18n['Rename project']}</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  )

}