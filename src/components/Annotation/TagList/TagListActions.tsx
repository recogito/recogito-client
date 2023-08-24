import { DotsThreeVertical } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import type { Translations } from 'src/Types';

interface TagListActionsProps {

  i18n: Translations;

}

export const TagListActions = (props: TagListActionsProps) => {

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button className="comment-actions unstyled icon-only">
          <DotsThreeVertical size={20} weight="bold" />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content className="dropdown-content" sideOffset={5} align="start">
          <Dropdown.Item className="dropdown-item">
            <span>TODO</span>
          </Dropdown.Item>

          <Dropdown.Item className="dropdown-item">
            <span>TODO</span>
          </Dropdown.Item>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  )

}