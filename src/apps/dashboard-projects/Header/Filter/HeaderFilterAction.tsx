import { Check, CaretDown } from '@phosphor-icons/react';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import './HeaderFilterAction.css';

export type Filters = 'active' | 'locked' | 'all';

interface HeaderFilterActionProps {

  onChangeFilter(filter: Filters): void;
}

export const HeaderFilterAction = (props: HeaderFilterActionProps) => {
  const { t } = useTranslation(['dashboard-projects']);

  const [filter, setFilter] = useState<Filters>('active');

  const changeFilter = (f: Filters) => () => {
    setFilter(f);
    props.onChangeFilter(f);
  };

  const item = (f: Filters) => (
    <Dropdown.Item
      className={f === filter ? 'dropdown-item' : 'dropdown-item no-icon'}
      onSelect={changeFilter(f)}
    >
      {f === filter && <Check size={16} />} {t(f)}
    </Dropdown.Item>
  );

  return (
    <Dropdown.Root>
      <Dropdown.Trigger asChild>
        <button>
          <div className='header-filter-row'>
            <div>{`${t('View', { ns: 'dashboard-projects' })}: `}</div>
            <div className='header-filter-bold'>{t(filter)}</div>
            <CaretDown size={16} />
          </div>
        </button>
      </Dropdown.Trigger>

      <Dropdown.Portal>
        <Dropdown.Content align='end' className='dropdown-content'>
          {item('all')}
          {item('active')}
          {item('locked')}
        </Dropdown.Content>
      </Dropdown.Portal>
    </Dropdown.Root>
  );
};
