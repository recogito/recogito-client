import type { PresentUser } from '@annotorious/react';
import { AnnotationLayers } from './AnnotationLayers';
import { Contributors } from './Contributors';
import { Tags } from './Tags';
import { Visibility } from './Visibility';
import type { Layer } from 'src/Types';

import './FilterPanel.css';

interface FilterPanelProps {

  layers?: Layer[];

  layerNames: Map<string, string>;

  present: PresentUser[];

}

export const FilterPanel = (props: FilterPanelProps) => {

  return (
    <div className='anno-drawer-panel filter-panel not-annotatable'>
      <AnnotationLayers
        layers={props.layers}
        layerNames={props.layerNames} />

      <Visibility  />

      <Contributors  
        present={props.present} />

      <Tags />
    </div>
  )

}
