import * as Select from '@radix-ui/react-select';
import type { PresentUser } from '@annotorious/react';
import { CaretDown, Check, Palette } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { useColorCodingState } from './ColorState';
import { 
  useColorByCreator,
  useColorByFirstTag,
  useColorByPrivacy 
} from './colorCodings';

import './ColorCodingSelector.css';

interface ColorCodingSelectorProps {

  i18n: Translations;

  present: PresentUser[];
  
}

export const ColorCodingSelector = (props: ColorCodingSelectorProps) => {

  const { t } = props.i18n;

  const byCreator = useColorByCreator(props.present);
  
  const byFirstTag = useColorByFirstTag();

  const byPrivacy = useColorByPrivacy();

  const { coding, setCoding } = useColorCodingState();

  const onChange = (key: string) => {
    if (key === 'creator') {
      setCoding(byCreator);
    } else if (key === 'tag') {
      // props.onChange(byFirstTag);
    } else if (key === 'privacy') {
      // props.onChange(byPrivacy);
    } else {
      setCoding(undefined);
    }
  }

  return (
    <Select.Root 
      onValueChange={onChange}
      defaultValue="none">
      <Select.Trigger 
        className="select-trigger color-coding-selector-trigger" 
        aria-label="Annotation color by">
        <Palette size={18} />
        <Select.Value />
        <Select.Icon className="select-icon">
          <CaretDown />
        </Select.Icon>
      </Select.Trigger>
      
      <Select.Portal>
        <Select.Content className="select-content" position="popper">
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
  )

}