import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { Translations } from 'src/Types';

interface SortSelectorProps {

  i18n: Translations;

  onChange(sorting: Sorting): void;

}

export enum Sorting {

  NEWEST = 'NEWEST',

  OLDEST = 'OLDEST'

}

export const SortSelector = (props: SortSelectorProps) => {

  const { t } = props.i18n;

  return (
    <div className="document-notes-list-sorting">
      <label>{t['Sort by']}</label>

      <Select.Root defaultValue={Sorting.NEWEST} onValueChange={props.onChange}>
        <Select.Trigger className="select-trigger" aria-label="Filter annotations by">
          <Select.Value />
          <Select.Icon className="select-icon">
            <CaretDown />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content">
            <Select.Viewport className="select-viewport">
              <Select.Item value={Sorting.NEWEST} className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['newest']}</Select.ItemText>
              </Select.Item>

              <Select.Item value={Sorting.OLDEST} className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t['oldest']}</Select.ItemText>
              </Select.Item> 
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )

}