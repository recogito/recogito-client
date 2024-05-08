import { useEffect, useState } from 'react';
import type { Filter, PresentUser } from '@annotorious/react';
import { Creators } from './Creators';
import { Tags } from './Tags';
import { Visibility } from './Visibility';
import type { Translations } from 'src/Types';

import './FilterPanel.css';

interface FilterPanelProps {

  i18n: Translations;

  present: PresentUser[];

  onSetFilter(filter?: Filter): void;

}

export const FilterPanel = (props: FilterPanelProps) => {

  const [tagFilter, setTagFilter] = useState<Filter | undefined>();

  useEffect(() => {
    // TODO merge filters
    props.onSetFilter(tagFilter); 
  }, [tagFilter]);

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      <Visibility 
        i18n={props.i18n} />

      <Creators 
        i18n={props.i18n} 
        present={props.present} />

      <Tags 
        onSetFilter={f => setTagFilter(() => f)} />
    </div>
  )

}