import { useEffect, useState } from 'react';
import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { Annotation, PresentUser } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { useFiltering } from './useFiltering';
import { filterByCreator } from './filters';

interface FilterSettingsProps {

  i18n: Translations;

  layers?: Layer[];

  present: PresentUser[];

  onChangeFilter(filter?: ((a: Annotation) => boolean)): void;
  
}

export const FilterSettings = (props: FilterSettingsProps) => {

  const { t } = props.i18n;

  const [value, setValue] = useState('none');

  const { filter, values, setConfig, setPresent } = useFiltering(props.present);

  const showAssignmentOption = props.layers && props.layers.length > 1;

  const onValueChange = (value: string) => {
    setValue(value);

    if (value === 'none') {
      setConfig();
    } else if (value === 'privacy') {
      // 
    } else if (value === 'assignment') {
      // if (props.layers)
      //   setCoding(colorByAssignment(props.layers));
    } else if (value === 'creator') {
      setConfig(filterByCreator);
    } else if (value === 'tag') {
      // setCoding(colorByFirstTag);
    }
  }

  /*
  const setDummyFilter = () => {
    const dummyFilter = (a: Annotation) =>
      Boolean(a.bodies.find(b => b.purpose === 'tagging' && b.value === 'Foo'));

    props.onChangeFilter(dummyFilter);
  }
  */

  useEffect(() => setPresent(props.present), [props.present]);

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

      <div className="layer-configuration-legend filter-settings-legend">
        {values && (
          <ul>
            {values.map(({ label, selected }, index) => (
              <li key={`${label}-${index}`}>
                {t[label] || label} {selected}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )

}