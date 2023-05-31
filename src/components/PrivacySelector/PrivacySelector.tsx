import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { CaretDown, Check, Detective, UsersThree } from '@phosphor-icons/react';

import './PrivacySelector.css';

interface PrivacySelectorProps {

}

const { Content, ItemIndicator, Portal, RadioGroup, RadioItem, Root, Trigger } = Dropdown;

export const PrivacySelector = (props: PrivacySelectorProps) => {

  return (
    <Root>
      <Trigger asChild>
        <button className="privacy-selector-trigger">
          <Detective size={18} />
          <span>Private</span>   
          <CaretDown size={14} />
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content wide" sideOffset={5} align="center">
          <RadioGroup value="private">
            <RadioItem value="private" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check />
              </ItemIndicator>
              <Detective size={16} /> <strong>Private</strong>
              <p>
                Annotations you create in Private mode will be visible
                to <strong>no-one except you</strong>.
              </p>
            </RadioItem>

            <RadioItem value="public" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check />
              </ItemIndicator>
              <UsersThree /> <strong>Public</strong>
              <p>
                Public annotations are visible to anyone with
                access to this document. This may include <strong>invited
                users or the general public</strong>.
              </p>
            </RadioItem>
          </RadioGroup>
        </Content>
      </Portal>
    </Root>
  )

}