import type { PresentUser } from '@annotorious/react';
import { Creators } from './Creators';
import { Tags } from './Tags';
import { Visibility } from './Visibility';
import type { Translations } from 'src/Types';

import './FilterPanel.css';

interface FilterPanelProps {

  i18n: Translations;

  present: PresentUser[];

}

export const FilterPanel = (props: FilterPanelProps) => {

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      <Visibility 
        i18n={props.i18n} />

      <Creators 
        i18n={props.i18n} 
        present={props.present} />

      <Tags />
    </div>
  )

}