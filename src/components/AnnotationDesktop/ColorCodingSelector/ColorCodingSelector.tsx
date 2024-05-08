import * as Select from '@radix-ui/react-select';
import type { DrawingStyleExpression } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { CaretDown, Check, Palette } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { 
  useColorByCreator,
  useColorByFirstTag,
  useColorByPrivacy 
} from './colorCodings';

import './ColorCodingSelector.css';

interface ColorCodingSelectorProps {

  i18n: Translations;

  onChange(style?: DrawingStyleExpression<SupabaseAnnotation>): void;
  
}

export const ColorCodingSelector = (props: ColorCodingSelectorProps) => {

  const { t } = props.i18n;

  const byCreator = useColorByCreator();
  
  const byFirstTag = useColorByFirstTag();

  const byPrivacy = useColorByPrivacy();

  const onChange = (key: string) => {
    if (key === 'creator') {
      props.onChange(byCreator);
    } else if (key === 'tag') {
      props.onChange(byFirstTag);
    } else if (key === 'privacy') {
      props.onChange(byPrivacy);
    } else {
      props.onChange();
    }
  }

  return (
    <Select.Root 
      onValueChange={onChange}>
      <Select.Trigger 
        className="select-trigger color-coding-selector-trigger" 
        aria-label="Annotation color by">
        <Palette size={18} />
        <Select.Value placeholder="Ohne Farbschema" />
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