import { AnnotationLayers } from './AnnotationLayers/AnnotationLayers';
import { Visibility } from './Visibility';
import type { Translations } from 'src/Types';

interface FilterPanelProps {

  i18n: Translations;

}

export const FilterPanel = (props: FilterPanelProps) => {

  return (
    <div className="anno-drawer-panel filter-panel not-annotatable">
      <AnnotationLayers />
      <Visibility i18n={props.i18n} />
    </div>
  )

}