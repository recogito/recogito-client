import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import { Visibility, type Annotation, type Formatter } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { AssignmentConfiguration } from './configurations';
import type { LayerConfiguration } from './LayerConfiguration';

import './LayersPanel.css';

interface LayerConfigurationProps {

  i18n: Translations;

  layers?: Layer[];

  onChange(formatter?: Formatter): void;
  
}

const PRIVACY_FORMATTER: Formatter = (annotation: Annotation) => ({
  //@ts-ignore
  fill: annotation.visibility === Visibility.PRIVATE ? '#ff0000' : '#0000ff'
});

export const LayersPanel = (props: LayerConfigurationProps) => {

  const [value, setValue] = useState('none');

  const [config, setConfig] = useState<LayerConfiguration | undefined>();

  const onValueChange = (value: string) => {
    setValue(value);

    if (value === 'none') {
      props.onChange();
      setConfig(undefined);
    } else if (value === 'privacy') {
      props.onChange();
      setConfig(undefined);
    } else if (value === 'assignment') {
      const config = AssignmentConfiguration();
      props.onChange(config.formatter);
      console.log(config);
      setConfig(AssignmentConfiguration);
    } else if (value === 'creator') {
      props.onChange();
      setConfig(undefined);
    }
  }

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
        {config && (
          <ul>
            {config.legend.map(({ label, color }) => (
              <li key={label}>
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}