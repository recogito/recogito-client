import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { CaretDown, Check, Detective, UsersThree } from '@phosphor-icons/react';
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
            <Detective size={18} />
          ) : (            
            <UsersThree size={18} />
          )}
          <span>
            {mode === 'PRIVATE' ? t['Private'] : t['Public']}
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
              <Detective size={20} /> <strong>{t['Private']}</strong>
              <p>
                {t['Private_Hint_01']} <strong>{t['Private_Hint_02']}</strong>
              </p>
            </RadioItem>

            <RadioItem value="PUBLIC" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check size={20} />
              </ItemIndicator>
              <UsersThree size={20} /> <strong>{t['Public']}</strong>
              <p>
                {t['Public_Hint_01']} <strong>{t['Public_Hint_02']}</strong>
              </p>
            </RadioItem>
          </RadioGroup>
        </Content>
      </Portal>
    </Root>
  )

}