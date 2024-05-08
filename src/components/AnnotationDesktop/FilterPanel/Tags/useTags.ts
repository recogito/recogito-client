import { useAnnotations, type AnnotationBody } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { useMemo } from 'react';

export const enumerateTags = (annotations: SupabaseAnnotation[]) => 
  annotations.reduce<AnnotationBody[]>((enumerated, annotation) => {
    const tags = annotation.bodies.filter(b => b.purpose === 'tagging');
    return [...enumerated, ...tags];
  }, [])
  .sort((a, b) => a.created! > b.created! ? 1 : -1)
  .reduce((firstOccurrences, body) => {
    if (body.value) {
      return firstOccurrences.indexOf(body.value) < 0 ? [...firstOccurrences, body.value] : firstOccurrences;
    } else {
      return firstOccurrences;
    }
  }, [] as string[]);

export const useTags = () => {

  const annotations = useAnnotations(250);

  const tags = useMemo(() => enumerateTags(annotations), [annotations]);

  return tags;

}