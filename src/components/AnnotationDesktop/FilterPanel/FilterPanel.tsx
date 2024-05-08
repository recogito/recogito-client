import { useEffect, useState } from 'react';
import type { Annotation, Filter, PresentUser } from '@annotorious/react';
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

  const [creatorFilter, setCreatorFilter] = useState<Filter | undefined>();

  const [tagFilter, setTagFilter] = useState<Filter | undefined>();

  useEffect(() => {
    const filters = [
      creatorFilter!,
      tagFilter!
    ].filter(Boolean);

    if (filters.length > 0) {
      const chained = (a: Annotation) => filters.every(fn => fn(a));
      props.onSetFilter(chained);
    } else {
      props.onSetFilter(undefined); 
    }
  }, [creatorFilter, tagFilter]);

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      <Visibility 
        i18n={props.i18n} />

      <Creators 
        i18n={props.i18n} 
        present={props.present} 
        onSetFilter={f => setCreatorFilter(() => f)} />

      <Tags 
        onSetFilter={f => setTagFilter(() => f)} />
    </div>
  )

}