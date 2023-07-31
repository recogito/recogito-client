import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { Visibility, type Annotation, type Formatter } from '@annotorious/react';
import type { Translations } from 'src/Types';

import './StyleConfiguration.css';

interface StyleConfigurationProps {

  i18n: Translations;

  onChange(formatter?: Formatter): void;
  
}

const PRIVACY_FORMATTER: Formatter = (annotation: Annotation) => ({
  fill: annotation.visibility === Visibility.PRIVATE ? 0xff0000 : 0x0000ff
});

export const StyleConfiguration = (props: StyleConfigurationProps) => {

  const [value, setValue] = useState('none');

  const onValueChange = (value: string) => {
    setValue(value);

    if (value === 'none')
      props.onChange();
    else if (value === 'privacy')
      props.onChange(PRIVACY_FORMATTER);
  }

  return (
    <div className="anno-sidepanel style-configuration">
      <form>
        <label>Color by</label>
        <Select.Root value={value} onValueChange={onValueChange}>
          <Select.Trigger className="select-trigger" aria-label="Annotation color by">
            <Select.Value />
            <Select.Icon className="select-icon">
              <CaretDown />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="select-content">
              <Select.Viewport className="select-viewport">
                <Select.Item value="none" className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>No color coding</Select.ItemText>
                </Select.Item>

                <Select.Item value="privacy" className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>Public vs. Private</Select.ItemText>
                </Select.Item> 
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </form>
    </div>
  )

}