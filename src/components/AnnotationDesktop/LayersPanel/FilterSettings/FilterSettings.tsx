import { useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { Annotation } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';

interface FilterSettingsProps {

  i18n: Translations;

  layers?: Layer[];

  onChangeFilter(filter?: ((a: Annotation) => boolean)): void;
  
}

export const FilterSettings = (props: FilterSettingsProps) => {

  const { t } = props.i18n;

  const [value, setValue] = useState('none');

  const showAssignmentOption = props.layers && props.layers.length > 1;

  const onValueChange = (value: string) => {
    // TODO
    setValue(value);
  }

  /*
  const setDummyFilter = () => {
    const dummyFilter = (a: Annotation) =>
      Boolean(a.bodies.find(b => b.purpose === 'tagging' && b.value === 'Foo'));

    props.onChangeFilter(dummyFilter);
  }
  */

  return (
    <div className="layer-configuration-filter-settings">
      <form>
        <label>{t['Filter by']}</label>

        <Select.Root value={value} onValueChange={onValueChange}>
          <Select.Trigger className="select-trigger" aria-label="Filter annotations by">
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
                  <Select.ItemText>{t['Show all annotations']}</Select.ItemText>
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
                  <Select.ItemText>{t['Tag']}</Select.ItemText>
                </Select.Item> 
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>
      </form>
    </div>
  )

}