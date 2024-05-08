import type { Annotation, AnnotationState, Color, DrawingStyle, DrawingStyleExpression } from '@annotorious/react';
import { useAuthorColors } from '@components/AnnotationDesktop';

const UNKNOWN_CREATOR: Color = '#727272';

const getCreator = (annotation: Annotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

export const useColorByCreator = () => {

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

  return style;

}