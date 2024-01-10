import { useEffect, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check } from '@phosphor-icons/react';
import type { Annotation, DrawingStyle } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { useColorCoding } from './ColorState';
import { 
  colorByAssignment, 
  colorByCreator,
  colorByFirstTag, 
  colorByPrivacy
} from './colorCodings';

interface ColorSettingsProps {

  i18n: Translations;

  layers?: Layer[];

  onChangeStyle(style?: ((a: Annotation) => DrawingStyle)): void;
  
}

export const ColorSettings = (props: ColorSettingsProps) => {

  const { t } = props.i18n;

  const { name, legend, style, setCoding } = useColorCoding();

  const [value, setValue] = useState(name || 'none');

  const showAssignmentOption = props.layers && props.layers.length > 1;

  const onValueChange = (value: string) => {
    setValue(value);

    if (value === 'none') {
      setCoding();
    } else if (value === 'privacy') {
      setCoding(colorByPrivacy);
    } else if (value === 'assignment') {
      if (props.layers)
        setCoding(colorByAssignment(props.layers));
    } else if (value === 'creator') {
      setCoding(colorByCreator);
    } else if (value === 'tag') {
      setCoding(colorByFirstTag);
    }
  }

  useEffect(() => props.onChangeStyle(style), [style]);

  return (
    <div className="layer-configuration-color-settings layer-configuration-section">
      <Select.Root value={value} onValueChange={onValueChange}>
        <div className="layer-configuration-selection">
          <label>{t['Color by']}</label>

          <Select.Trigger className="select-trigger" aria-label="Annotation color by">
            <Select.Value />
            <Select.Icon className="select-icon">
              <CaretDown />
            </Select.Icon>
          </Select.Trigger>
        </div>

        <Select.Portal>
          <Select.Content className="select-content">
            <Select.Viewport className="select-viewport">
              <Select.Item value="none" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['No color coding']}</Select.ItemText>
              </Select.Item>

              <Select.Item value="privacy" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['Public vs. Private']}</Select.ItemText>
              </Select.Item> 

              {showAssignmentOption && (
                <Select.Item value="assignment" className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>{t['Assignment']}</Select.ItemText>
                </Select.Item> 
              )}

              <Select.Item value="creator" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['Creator']}</Select.ItemText>
              </Select.Item> 

              <Select.Item value="tag" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['First Tag']}</Select.ItemText>
              </Select.Item> 
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>

      <div className="layer-configuration-legend color-settings-legend">
        {legend && (
          <ul>
            {legend.map(({ label, color }, index) => (
              <li key={`${label}-${index}`}>
                <span 
                  className="legend-color" 
                  style={{ backgroundColor: color }}/> {t[label] || label}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}