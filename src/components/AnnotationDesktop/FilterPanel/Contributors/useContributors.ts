import { useMemo } from 'react';
import { type PresentUser, useAnnotations } from '@annotorious/react';
import { enumerateContributors } from '@recogito/studio-sdk';
import { useFilterSettingsState } from '@recogito/studio-sdk/components';

export const useContributors = (present: PresentUser[]) => {

  const annotations = useAnnotations(250);

  const { layerSettings } = useFilterSettingsState();

  const visibleLayers = layerSettings?.state;

  const contributors = useMemo(() => (
    enumerateContributors(present, annotations, visibleLayers)
  ), [present, annotations, visibleLayers]);

  return contributors;

}