import { useEffect, useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { CaretDown, Check, Palette } from '@phosphor-icons/react';
import type { Annotation, DrawingStyle } from '@annotorious/react';
import { useAuthorColors } from '@components/AnnotationDesktop';
import type { Layer, Translations } from 'src/Types';

import './DummyColorSettings.css';

interface ColorSettingsProps {

  i18n: Translations;
  
}

export const ColorSettings = (props: ColorSettingsProps) => {

  const { t } = props.i18n;

  const authorColors = useAuthorColors();

  return (
    <Select.Root>
      <Select.Trigger className="select-trigger color-selector-trigger" aria-label="Annotation color by">
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