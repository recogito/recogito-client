import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';

import './StyleConfiguration.css';

interface StyleConfigurationProps {
  
}

export const StyleConfiguration = (props: StyleConfigurationProps) => {

  const [value, setValue] = useState('privacy');

  return (
    <div className="anno-sidepanel style-configuration">
      <form>
        <label>Color by</label>
        <Select.Root value={value} onValueChange={setValue}>
          <Select.Trigger className="select-trigger" aria-label="Annotation color by">
            <Select.Value />
            <Select.Icon className="select-icon">
              <CaretDown />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content className="select-content">
              <Select.Viewport className="select-viewport">
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