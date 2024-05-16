import { useMemo } from 'react';
import { useAnnotations } from '@annotorious/react';
import type { Color, PresentUser } from '@annotorious/react';
import { enumerateCreators, getDisplayName, useAuthorColors } from '@components/AnnotationDesktop';
import type { ColorCoding } from '../ColorCoding';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

const UNKNOWN_CREATOR: Color = '#727272';

const getCreator = (annotation: SupabaseAnnotation) =>
  annotation.target?.creator || 
    (annotation.bodies.length > 0 ? annotation.bodies[0].creator : undefined);

export const useColorByCreator = (present: PresentUser[]): ColorCoding => {

  const annotations = useAnnotations(500);

  const authorColors = useAuthorColors();

  const style = (annotation: SupabaseAnnotation): Color => {
    const creator = getCreator(annotation);

    if (creator) {
      const assignedColor = authorColors.getColor(creator);
      if (assignedColor) {
        return assignedColor as Color;
      } else {
        return UNKNOWN_CREATOR;
      }
    } else {
      return UNKNOWN_CREATOR;
    }
  }

  const legend = useMemo(() => {
    const creators = enumerateCreators(present, annotations);
    return creators.map(user => 
      ({ color: authorColors.getColor(user) as Color, label: getDisplayName(user) }));
  }, [present, annotations]);

  return { name: 'creator', style, legend };

}