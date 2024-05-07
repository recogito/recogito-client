import { AnnotationLayers } from './AnnotationLayers/AnnotationLayers';
import { Visibility } from './Visibility';
import type { Translations } from 'src/Types';

import './FilterPanel.css';
import { Creators } from './Creators';
import { Tags } from './Tags';

interface FilterPanelProps {

  i18n: Translations;

}

export const FilterPanel = (props: FilterPanelProps) => {

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      {/* <AnnotationLayers /> */}
      <Visibility i18n={props.i18n} />

      <Creators />

      <Tags />
    </div>
  )

}