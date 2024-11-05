import { useEffect, useMemo } from 'react';
import * as Select from '@radix-ui/react-select';
import type { PresentUser } from '@annotorious/react';
import { CaretDown, Check, Palette } from '@phosphor-icons/react';
import { useLocalStorageBackedState } from '@util/hooks';
import type { DocumentLayer, DocumentWithContext, Translations, VocabularyTerm } from 'src/Types';
import { useColorCodingState } from './ColorState';
import { 
  useColorByCreator,
  useColorByFirstTag,
  useColorByPrivacy, 
  userColorByLayer
} from './colorCodings';

import './ColorCodingSelector.css';

interface ColorCodingSelectorProps {

  document: DocumentWithContext;

  i18n: Translations;

  layers?: DocumentLayer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

  tagVocabulary?: VocabularyTerm[];

}

type Coding = 'creator' | 'layer' | 'tag' | 'privacy';

export const ColorCodingSelector = (props: ColorCodingSelectorProps) => {

  const { t } = props.i18n;

  const persistenceKey = useMemo(() => 
    `colorcoding-${props.document.context.id}-${props.document.id}`, 
  [props.document])

  const [current, setCurrent] = useLocalStorageBackedState<Coding | undefined>(persistenceKey, undefined);

  // TODO: this is actually super in-efficient! Doesn't make much
  // difference for now, but should be improved. Instead of hooks 
  // (which compute all codings on every change), we should
  // pack this into components. This way: i) only the
  // current color coding will be computed, ii) no coding will 
  // be computed if the legend is not open.
  const byCreator = useColorByCreator(props.present);
  
  const byFirstTag = useColorByFirstTag(props.tagVocabulary);

  const byLayer = userColorByLayer(props.layers, props.layerNames);

  const byPrivacy = useColorByPrivacy();

  const { setColorCoding } = useColorCodingState();

  // Quick hack to make color legends update without having to
  // refresh the page. Inefficient, but works for now.
  useEffect(() => {
    if (current === 'creator') {
      setColorCoding(byCreator);
    } else if (current === 'layer') {
      setColorCoding(byLayer);
    } else if (current === 'tag') {
      setColorCoding(byFirstTag);
    } else if (current === 'privacy') {
      setColorCoding(byPrivacy);
    } else {
      setColorCoding(undefined);
    }
  }, [current, byCreator, byFirstTag, byLayer, byPrivacy]);

  return (
    <Select.Root 
      value={current || 'none'}
      onValueChange={value => setCurrent(value as Coding)}>
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