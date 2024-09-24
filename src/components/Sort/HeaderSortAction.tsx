import { Check, CaretDown } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useEffect, useState } from 'react';
import type { ExtendedProjectData, Translations } from 'src/Types';
import type { SortFunction } from './SortFunction';
import './HeaderSortAction.css';

interface HeaderSortActionProps {
  i18n: Translations;

  onChangeSort(sortFn: SortFunction, name: string): void;
}

const Sorters = {
  Name: (a: ExtendedProjectData, b: ExtendedProjectData) =>
    a.name > b.name ? 1 : -1,

  Newest: (a: ExtendedProjectData, b: ExtendedProjectData) =>
    a.created_at < b.created_at ? 1 : -1,

  Oldest: (a: ExtendedProjectData, b: ExtendedProjectData) =>
    a.created_at > b.created_at ? 1 : -1,
};

export const HeaderSortAction = (props: HeaderSortActionProps) => {
  const { t } = props.i18n;

  const [sort, setSort] = useState<keyof typeof Sorters | undefined>();

  useEffect(() => {
    if (!sort) {
      setSort('Name');
      props.onChangeSort(Sorters['Name'], 'Name');
    }
  }, [sort]);

  const changeSort = (key: keyof typeof Sorters) => () => {
    setSort(key);
    props.onChangeSort(Sorters[key], key);
  };

  const item = (key: keyof typeof Sorters) => (
    <Dropdown.Item
      className={sort === key ? 'dropdown-item' : 'dropdown-item no-icon'}
      onSelect={changeSort(key)}
    >
      {sort === key && <Check size={16} />} {t[key]}
    </Dropdown.Item>
  );

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button>
          <div className='header-sort-row'>
            <div>{`${t['Sort']}: `}</div>
            <div className='header-sort-name '>{t[sort || 'Name']}</div>
            <CaretDown size={16} />
          </div>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content align='end' className='dropdown-content'>
          {item('Name')}
          {item('Newest')}
          {item('Oldest')}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
