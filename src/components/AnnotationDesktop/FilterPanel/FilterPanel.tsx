import { useEffect, useState } from 'react';
import type { Annotation, Filter, PresentUser } from '@annotorious/react';
import { Creators } from './Creators';
import { Tags } from './Tags';
import { Visibility } from './Visibility';
import type { Translations } from 'src/Types';

import './FilterPanel.css';
import { useFilterState } from './FilterState';

interface FilterPanelProps {

  i18n: Translations;

  present: PresentUser[];

  onSetFilter(filter?: Filter): void;

}

export const FilterPanel = (props: FilterPanelProps) => {

  const {
    creatorFilter, 
    setCreatorFilter,
    tagFilter, 
    setTagFilter,
    visibilityFilter, 
    setVisibilityFilter
  } = useFilterState();

  // Note: this may move into the context provider later
  useEffect(() => {
    const filters = [
      creatorFilter!,
      tagFilter!,
      visibilityFilter!
    ].filter(Boolean);

    if (filters.length > 0) {
      const chained = (a: Annotation) => filters.every(fn => fn(a));
      props.onSetFilter(chained);
    } else {
      props.onSetFilter(undefined); 
    }
  }, [creatorFilter, tagFilter, visibilityFilter]);

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      <Visibility 
        i18n={props.i18n} 
        onSetFilter={f => setVisibilityFilter(() => f)}/>

      <Creators 
        i18n={props.i18n} 
        present={props.present} 
        onSetFilter={f => setCreatorFilter(() => f)} />

      <Tags 
        onSetFilter={f => setTagFilter(() => f)} />
    </div>
  )

}