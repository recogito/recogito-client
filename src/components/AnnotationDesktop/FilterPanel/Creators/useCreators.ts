import { useMemo } from 'react';
import { type PresentUser, useAnnotations } from '@annotorious/react';
import { enumerateCreators } from '@components/AnnotationDesktop';

export const useCreators = (present: PresentUser[]) => {

  const annotations = useAnnotations(250);

  const creators = useMemo(() => (
    enumerateCreators(present, annotations)
  ), [present, annotations]);

  return creators;

}