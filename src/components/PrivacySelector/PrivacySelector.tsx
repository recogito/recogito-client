import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { CaretDown, Check, Detective, UsersThree } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

import './PrivacySelector.css';

export type PrivacyMode = 'PRIVATE' | 'PUBLIC';

interface PrivacySelectorProps {

  mode: PrivacyMode;

  onChangeMode(mode: PrivacyMode): void;

}

const { Content, ItemIndicator, Portal, RadioGroup, RadioItem, Root, Trigger } = Dropdown;

export const PrivacySelector = (props: PrivacySelectorProps) => {

  const { mode } = props;

  const { t } = useTranslation(['common', 'annotation-common']);

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
            {mode === 'PRIVATE' ? t('Private', { ns: 'common' }) : t('Public', { ns: 'common' })}
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
              <Detective size={20} /> <strong>{t('Private', { ns: 'common' })}</strong>
              <p>
                {t('Private_Hint_01', { ns: 'annotation-common' })} <strong>{t('Private_Hint_02', { ns: 'annotation-common' })}</strong>
              </p>
            </RadioItem>

            <RadioItem value="PUBLIC" className="dropdown-item">
              <ItemIndicator className="dropdown-indicator">
                <Check size={20} />
              </ItemIndicator>
              <UsersThree size={20} /> <strong>{t('Public', { ns: 'common' })}</strong>
              <p>
                {t('Public_Hint_01', { ns: 'annotation-common' })} <strong>{t('Public_Hint_02', { ns: 'annotation-common' })}</strong>
              </p>
            </RadioItem>
          </RadioGroup>
        </Content>
      </Portal>
    </Root>
  )

}