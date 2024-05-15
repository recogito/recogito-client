import { useMemo } from 'react';
import { Annotation, AnnotationState, DrawingStyle, useAnnotations, type Color } from '@annotorious/react';
import { enumerateTags } from '@components/AnnotationDesktop';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { ColorCoding } from '../ColorCoding';
import { createPalette } from './utils';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

export const useColorByFirstTag = (): ColorCoding => {

  const annotations = useAnnotations(500);

  const { getColor } = useMemo(() => createPalette(PALETTE), []);

  const style = useMemo(() => {
    return (annotation: Annotation, state?: AnnotationState): DrawingStyle => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        return { fill: getColor(firstTag), fillOpacity: state?.selected ? 0.5: 0.24 };
      } else {
        return { fill: NO_TAG, fillOpacity: state?.selected ? 0.5: 0.24 };
      }
    }
  }, [getColor]);

  const legend = useMemo(() => {
    const tags = enumerateTags(annotations);
    return tags.map(tag => ({ color: getColor(tag) as Color, label: tag }));
  }, [getColor, annotations]);

  return { name: 'tag', style, legend }; 

}
