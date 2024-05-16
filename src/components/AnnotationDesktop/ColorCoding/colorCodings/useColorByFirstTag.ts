import { useMemo } from 'react';
import { useAnnotations, type Color } from '@annotorious/react';
import { enumerateTags } from '@components/AnnotationDesktop';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { ColorCoding } from '../ColorCoding';
import { createPalette } from './utils';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

export const useColorByFirstTag = (): ColorCoding => {

  const annotations = useAnnotations(500);

  const { getColor } = useMemo(() => createPalette(PALETTE), []);

  const style = useMemo(() => {
    return (annotation: SupabaseAnnotation): Color => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        return getColor(firstTag);
      } else {
        return NO_TAG;
      }
    }
  }, [getColor]);

  const legend = useMemo(() => {
    const tags = enumerateTags(annotations);
    return tags.map(tag => ({ color: getColor(tag) as Color, label: tag }));
  }, [getColor, annotations]);

  return { name: 'tag', style, legend }; 

}
