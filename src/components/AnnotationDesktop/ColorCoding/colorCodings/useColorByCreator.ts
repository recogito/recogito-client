import { useMemo } from 'react';
import { useAnnotations } from '@annotorious/react';
import type { Annotation, AnnotationState, Color, DrawingStyle, PresentUser } from '@annotorious/react';
import { enumerateCreators, useAuthorColors } from '@components/AnnotationDesktop';
import type { ColorCoding } from '../ColorCoding';
import { getDisplayName } from '@components/AnnotationDesktop/LayerConfiguration/utils';

const UNKNOWN_CREATOR: Color = '#727272';

const getCreator = (annotation: Annotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

export const useColorByCreator = (present: PresentUser[]): ColorCoding => {

  const annotations = useAnnotations(500);

  const authorColors = useAuthorColors();

  const style = (annotation: Annotation, state?: AnnotationState): DrawingStyle => {
    const creator = getCreator(annotation);

    if (creator) {
      const assignedColor = authorColors.getColor(creator);
      if (assignedColor) {
        return { fill: assignedColor as Color, fillOpacity: state?.selected ? 0.5: 0.24 };
      } else {
        return { fill: UNKNOWN_CREATOR, fillOpacity: state?.selected ? 0.5: 0.24 };
      }
    } else {
      return { fill: UNKNOWN_CREATOR, fillOpacity: state?.selected ? 0.45 : 0.14 };
    }
  }

  const legend = useMemo(() => {
    const creators = enumerateCreators(present, annotations);
    return creators.map(user => 
      ({ color: authorColors.getColor(user) as Color, label: getDisplayName(user) }));
  }, [present, annotations]);

  return { name: 'creator', style, legend };

}