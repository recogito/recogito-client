import { CaretDown, Check } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import { Sorting, type Sorter } from './Sorting';
import { useTranslation } from 'react-i18next';

interface SortSelectorProps {

  onChange(sorting: Sorter): void;

}

const SORTINGS: { [key: string]: Sorter } = {

  newest: Sorting.Newest,

  oldest: Sorting.Oldest

}

export const SortSelector = (props: SortSelectorProps) => {
  const { t } = useTranslation(['annotation-common']);

  return (
    <div className="document-notes-list-sorting">
      <label>{t('Sort by', { ns: 'annotation-common' })}</label>

      <Select.Root 
        defaultValue="newest" 
        onValueChange={value => props.onChange(SORTINGS[value])}>
        <Select.Trigger className="select-trigger" aria-label={t('Sort annotations by', { ns: 'annotation-common' })}>
          <Select.Value />
          <Select.Icon className="select-icon">
            <CaretDown />
          </Select.Icon>
        </Select.Trigger>

        <Select.Portal>
          <Select.Content className="select-content">
            <Select.Viewport className="select-viewport">
              <Select.Item value={"newest"} className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t('newest', { ns: 'annotation-common' })}</Select.ItemText>
              </Select.Item>

              <Select.Item value="oldest" className="select-item">
                <Select.ItemIndicator className="select-item-indicator">
                  <Check />
                </Select.ItemIndicator>
                <Select.ItemText>{t('oldest', { ns: 'annotation-common' })}</Select.ItemText>
              </Select.Item> 
            </Select.Viewport>
          </Select.Content>
        </Select.Portal>
      </Select.Root>
    </div>
  )

}