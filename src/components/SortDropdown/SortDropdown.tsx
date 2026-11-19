import { CaretDownIcon, CheckIcon } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import classNames from 'classnames';
import { useTranslation } from 'react-i18next';

import './SortDropdown.css';

export interface SortOption<T extends string = string> {
  value: T;

  label: string;
}

interface SortDropdownProps<T extends string> {
  className?: string;

  options: SortOption<T>[];

  value: T;

  onChange(value: T): void;
}

export const SortDropdown = <T extends string>(props: SortDropdownProps<T>) => {
  const { t } = useTranslation(['common']);

  const current = props.options.find((o) => o.value === props.value);

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button
          type='button'
          className={classNames('sort-dropdown-trigger', props.className)}
        >
          <span>{`${t('Sort', { ns: 'common' })}:`}</span>
          <span className='sort-dropdown-current'>
            {props.options.map((option) => (
              <span
                key={option.value}
                aria-hidden={option !== current}
                className={classNames('sort-dropdown-label', {
                  'is-hidden': option !== current,
                })}
              >
                {option.label}
              </span>
            ))}
          </span>
          <CaretDownIcon size={16} />
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content
          align='end'
          sideOffset={5}
          className='dropdown-content'
        >
          <Dropdown.RadioGroup
            value={props.value}
            onValueChange={(value) => props.onChange(value as T)}
          >
            {props.options.map((option) => (
              <Dropdown.RadioItem
                key={option.value}
                value={option.value}
                className={classNames('dropdown-item', {
                  'no-icon': option.value !== props.value,
                })}
              >
                <Dropdown.ItemIndicator>
                  <CheckIcon size={16} />
                </Dropdown.ItemIndicator>
                {option.label}
              </Dropdown.RadioItem>
            ))}
          </Dropdown.RadioGroup>
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
