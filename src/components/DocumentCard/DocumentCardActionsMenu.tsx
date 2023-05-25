import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

export interface DocumentCardActionsMenuProps {

  i18n: Translations;

  onDelete(): void;

}

export const DocumentCardActionsMenu = (props: DocumentCardActionsMenuProps) => {

  const { t } = props.i18n;

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
            <Trash size={16} /> <span>{t['Delete document']}</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  )

}