import { useMemo } from 'react';
import { type PresentUser, useAnnotations } from '@annotorious/react';
import { enumerateContributors, useFilterSettingsState } from '@components/AnnotationDesktop';

export const useContributors = (present: PresentUser[]) => {

  const annotations = useAnnotations(250);

  const { layerSettings } = useFilterSettingsState();

  const visibleLayers = layerSettings?.state;

  const contributors = useMemo(() => (
    enumerateContributors(present, annotations, visibleLayers)
  ), [present, annotations, visibleLayers]);

  return contributors;

}