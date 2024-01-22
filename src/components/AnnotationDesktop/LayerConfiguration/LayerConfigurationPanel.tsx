import type { Annotation, DrawingStyle, PresentUser } from '@annotorious/react';
import type { Layer, Translations } from 'src/Types';
import { ColorSettings } from './ColorSettings';
import { FilterSettings } from './FilterSettings';

import './LayerConfigurationPanel.css';

interface LayerConfigurationPanelProps {

  i18n: Translations;

  layers?: Layer[];

  present: PresentUser[];

  onChangeStyle(style?: ((a: Annotation) => DrawingStyle)): void;

  onChangeFilter(filter?: ((a: Annotation) => boolean)): void;
  
}

export const LayerConfigurationPanel = (props: LayerConfigurationPanelProps) => {

  return (
    <div className="anno-sidepanel layer-configuration">
      <ColorSettings
        i18n={props.i18n}
        layers={props.layers}
        onChangeStyle={props.onChangeStyle} />

      <FilterSettings 
        i18n={props.i18n}
        layers={props.layers}
        onChangeFilter={props.onChangeFilter} />
    </div>
  )

}