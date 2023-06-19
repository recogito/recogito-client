import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { DotsThreeVertical, PencilSimple, Trash } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface DocumentCardActionsProps {

  i18n: Translations;

  onDelete(): void;

  onRename(): void;

}

export const DocumentCardActions = (props: DocumentCardActionsProps) => {

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

          <Item className="dropdown-item" onSelect={props.onRename}>
            <PencilSimple size={16} /> <span>{t['Rename document']}</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  )

}