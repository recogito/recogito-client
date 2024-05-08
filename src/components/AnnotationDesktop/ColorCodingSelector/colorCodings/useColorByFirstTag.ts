import { useMemo } from 'react';
import { Annotation, AnnotationState, DrawingStyle, useAnnotations, type Color } from '@annotorious/react';
import { AdobeCategorical12 } from '../ColorPalettes';

const PALETTE = AdobeCategorical12;

export const createTagPalette = () => {

  const assignedColors = new Map<string, Color>();

  let nextIndex = 0;

  const getColor = (tag: string) => {
    const assigned = assignedColors.get(tag);
    if (assigned)
      return assigned;

    // Assign next free color
    const nextColor = PALETTE[nextIndex];

    assignedColors.set(tag, nextColor);

    nextIndex = (nextIndex + 1) % PALETTE.length;

    return nextColor;
  }

  return {
    getColor
  }

}

const NO_TAG: Color = '#727272';

export const useColorByFirstTag = () => {

  const annotations = useAnnotations(250);

  const style = useMemo(() => {
    const { getColor } = createTagPalette();

    return (annotation: Annotation, state?: AnnotationState): DrawingStyle => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        return { fill: getColor(firstTag), fillOpacity: state?.selected ? 0.5: 0.24 };
      } else {
        return { fill: NO_TAG, fillOpacity: state?.selected ? 0.5: 0.24 };
      }
    }
  }, []);

  return style;

}
