import type { Annotation, DrawingStyle, PresentUser } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { ColorSettings } from './ColorSettings';
import { FilterSettings } from './FilterSettings';

import './LayersPanel.css';

interface LayersPanelProps {

  i18n: Translations;

  layers?: Layer[];

  present: PresentUser[];

  onChangeStyle(style?: ((a: Annotation) => DrawingStyle)): void;

  onChangeFilter(filter?: ((a: Annotation) => boolean)): void;
  
}

export const LayersPanel = (props: LayersPanelProps) => {

  return (
    <div className="anno-sidepanel layer-configuration">
      <ColorSettings
        i18n={props.i18n}
        layers={props.layers}
        present={props.present} 
        onChangeStyle={props.onChangeStyle} />

      <FilterSettings 
        i18n={props.i18n}
        layers={props.layers}
        onChangeFilter={props.onChangeFilter} />
    </div>
  )

}