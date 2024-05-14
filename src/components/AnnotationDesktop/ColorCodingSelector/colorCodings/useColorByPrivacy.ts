import type { AnnotationState, DrawingStyle } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { CarbonCategoricalDark14 } from '../ColorPalettes';

const PALETTE = CarbonCategoricalDark14;

export const useColorByPrivacy = () => {

  const style = (annotation: SupabaseAnnotation, state?: AnnotationState): DrawingStyle => {
    const color = annotation.visibility === Visibility.PRIVATE ?
      PALETTE[4] : PALETTE[7];

    return { fill: color, fillOpacity: state?.selected ? 0.5: 0.24 };
  }

  return style;

}