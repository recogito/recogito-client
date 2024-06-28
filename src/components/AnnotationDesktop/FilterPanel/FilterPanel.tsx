import type { PresentUser } from '@annotorious/react';
import { AnnotationLayers } from './AnnotationLayers';
import { Creators } from './Creators';
import { Tags } from './Tags';
import { Visibility } from './Visibility';
import type { Layer, Translations } from 'src/Types';

import './FilterPanel.css';

interface FilterPanelProps {

  i18n: Translations;

  layers?: Layer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

}

export const FilterPanel = (props: FilterPanelProps) => {

  return (
    <div className='anno-drawer-panel filter-panel not-annotatable'>
      <AnnotationLayers
        i18n={props.i18n}
        layers={props.layers}
        layerNames={props.layerNames} />

      <Visibility i18n={props.i18n} />

      <Creators i18n={props.i18n} present={props.present} />

      <Tags i18n={props.i18n} />
    </div>
  )

}
