import { useAnnotations, type AnnotationBody } from '@annotorious/react';
import { enumerateTags } from '@components/AnnotationDesktop/utils';
import { useMemo } from 'react';

export const useTags = () => {

  const annotations = useAnnotations(250);

  const tags = useMemo(() => enumerateTags(annotations), [annotations]);

  return tags;

}