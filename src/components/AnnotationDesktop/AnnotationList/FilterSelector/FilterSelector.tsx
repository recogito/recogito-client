import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { Translations } from 'src/Types';

interface FilterSelectorProps {

  i18n: Translations;

  onChange(filter: Filter): void;

}

export enum Filter {

  NONE = 'NONE',

  VIEWPORT = 'VIEWPORT',

  MINE = 'MINE'

}

export const FilterSelector = (props: FilterSelectorProps) => {

  const { t } = props.i18n;

  return (
    <div className="annotation-list-filter">
      <label>{t['Show']}</label>

      <Select.Root defaultValue={Filter.NONE} onValueChange={props.onChange}>
        <Select.Trigger className="select-trigger" aria-label="Filter annotations by">
          <Select.Value />
          <Select.Icon className="select-icon">
            <CaretDown />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content">
            <Select.Viewport className="select-viewport">
              <Select.Item value={Filter.NONE} className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['all annotations']}</Select.ItemText>
              </Select.Item>

              <Select.Item value={Filter.VIEWPORT} className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['annotations in current view']}</Select.ItemText>
              </Select.Item> 

              {/*
                <Select.Item value={Filter.MINE} className="select-item">
                  <Select.ItemIndicator className="select-item-indicator">
                    <Check />
                  </Select.ItemIndicator>
                  <Select.ItemText>my annotations only</Select.ItemText>
                </Select.Item> 
              */}
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )

}