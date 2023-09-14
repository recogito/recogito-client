import { useEffect, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { Formatter } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { useColorCoding } from './ColorCoding';
import { colorByAssignment } from './colorCodings';

import './LayersPanel.css';

interface LayersPanelProps {

  i18n: Translations;

  layers?: Layer[];

  onChange(formatter?: Formatter): void;
  
}

export const LayersPanel = (props: LayersPanelProps) => {

  const [value, setValue] = useState('none');

  const { formatter, legend, setCoding } = useColorCoding();

  const onValueChange = (value: string) => {
    setValue(value);

    if (value === 'none') {
      setCoding();
    } else if (value === 'privacy') {
      setCoding();
    } else if (value === 'assignment') {
      if (props.layers)
        setCoding(colorByAssignment(props.layers));
    } else if (value === 'creator') {
      setCoding();
    }
  }

  useEffect(() => {
    props.onChange(formatter);
  }, [formatter]);

  return (
    <div className="anno-sidepanel layer-configuration">
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

                <Select.Item value="assignment" className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>Assignment</Select.ItemText>
                </Select.Item> 

                <Select.Item value="creator" className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>Creator</Select.ItemText>
                </Select.Item> 
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </form>

      <div className="layer-configuration-legend">
        {legend && (
          <ul>
            {legend.map(({ label, color }) => (
              <li key={label}>
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: color }}/> {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}