import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { CaretDown, ChatCircleText, Check, Detective, UsersThree } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './PrivacySelector.css';

export type PrivacyMode = 'PRIVATE' | 'PUBLIC';

interface PrivacySelectorProps {

  i18n: Translations;

  mode: PrivacyMode;

  onChangeMode(mode: PrivacyMode): void;

}

const { Content, ItemIndicator, Portal, RadioGroup, RadioItem, Root, Trigger } = Dropdown;

export const PrivacySelector = (props: PrivacySelectorProps) => {

  const { mode } = props;

  const { t } = props.i18n;

  const onChange = (value: string) => 
    props.onChangeMode(value as PrivacyMode);

  return (
    <Root>
      <Trigger asChild>
        <button
          className="privacy-selector-trigger"
          data-privacy={mode.toLowerCase()}>
          {mode === 'PRIVATE' ? (
            <Detective size={20} />
          ) : (            
            <UsersThree size={20} />
          )}
          <span>
            {mode === 'PRIVATE' ? 'Private' : 'Public'}
          </span>   
          <CaretDown size={10} weight="bold" />
        </button>
      </Trigger>

      <Portal>
        <Content className="privacy-selector dropdown-content wide" sideOffset={5} align="center">
          <RadioGroup value={mode} onValueChange={onChange}>
            <RadioItem value="PRIVATE" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check size={20} />
              </ItemIndicator>
              <Detective size={20} /> <strong>Private</strong>
              <p>
                Annotations you create in Private mode will be visible
                to <strong>no-one except you</strong>.
              </p>
            </RadioItem>

            <RadioItem value="PUBLIC" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check size={20} />
              </ItemIndicator>
              <UsersThree size={20} /> <strong>Public</strong>
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