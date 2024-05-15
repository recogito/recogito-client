import * as Select from '@radix-ui/react-select';
import type { PresentUser } from '@annotorious/react';
import { CaretDown, Check, Palette } from '@phosphor-icons/react';
import type { DocumentLayer, Translations } from 'src/Types';
import { useColorCodingState } from './ColorState';
import { 
  useColorByCreator,
  useColorByFirstTag,
  useColorByPrivacy, 
  userColorByLayer
} from './colorCodings';

import './ColorCodingSelector.css';

interface ColorCodingSelectorProps {

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

}

export const ColorCodingSelector = (props: ColorCodingSelectorProps) => {

  const { t } = props.i18n;

  const byCreator = useColorByCreator(props.present);
  
  const byFirstTag = useColorByFirstTag();

  const byLayer = userColorByLayer(props.layers, props.layerNames);

  const byPrivacy = useColorByPrivacy();

  const { setColorCoding } = useColorCodingState();

  const onChange = (key: string) => {
    if (key === 'creator') {
      setColorCoding(byCreator);
    } else if (key === 'layer') {
      setColorCoding(byLayer);
    } else if (key === 'tag') {
      setColorCoding(byFirstTag);
    } else if (key === 'privacy') {
      setColorCoding(byPrivacy);
    } else {
      setColorCoding(undefined);
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

            {/* <Select.Item value="layer" className="select-item">
              <Select.ItemIndicator className="select-item-indicator">
                <Check />
              </Select.ItemIndicator>
              <Select.ItemText>{t['Layer']}</Select.ItemText>
            </Select.Item> */}

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