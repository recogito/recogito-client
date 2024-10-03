import { useAnnotations } from '@annotorious/react';
import { enumerateTags } from '@components/AnnotationDesktop/utils';
import { useMemo } from 'react';
import { useFilterSettingsState } from '../FilterState';

export const useTags = () => {

  const annotations = useAnnotations(250);

  const { layerSettings } = useFilterSettingsState();

  const visibleLayers = layerSettings?.state;

  const tags = useMemo(() => enumerateTags(annotations, visibleLayers), [annotations, visibleLayers]);

  return tags;

}