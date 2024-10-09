import { useMemo } from 'react';
import { type PresentUser, useAnnotations } from '@annotorious/react';
import { enumerateCreators, useFilterSettingsState } from '@components/AnnotationDesktop';

export const useCreators = (present: PresentUser[]) => {

  const annotations = useAnnotations(250);

  const { layerSettings } = useFilterSettingsState();

  const visibleLayers = layerSettings?.state;

  const creators = useMemo(() => (
    enumerateCreators(present, annotations, visibleLayers)
  ), [present, annotations, visibleLayers]);

  return creators;

}