import { Visibility, SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { AnnotationState, DrawingStyle } from '@annotorious/react';
import type { ColorCoding } from '../ColorCoding';
import { CarbonCategoricalDark14 } from '../ColorPalettes';

const PALETTE = CarbonCategoricalDark14;

export const colorByPrivacy = (): ColorCoding => {

  const getStyle = () => (annotation: SupabaseAnnotation, state?: AnnotationState): DrawingStyle => {
    const color = annotation.visibility === Visibility.PRIVATE ?
      PALETTE[4] : PALETTE[7];

    return { fill: color, fillOpacity: state?.selected ? 0.5: 0.24 };
  }

  const getLegend = () => [{
    color: PALETTE[4] , label: 'Your private annotations'
  }, {
    color: PALETTE[7] , label: 'All public annotations'
  }];

  const update = (_: SupabaseAnnotation[]) => getLegend();

  return { name: 'privacy', getLegend, getStyle, update };

}