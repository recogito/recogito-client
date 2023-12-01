import { Visibility, SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { DrawingStyle } from '@annotorious/react';
import type { ColorCoding } from '../ColorCoding';
import { CarbonCategoricalDark14 } from '../ColorPalettes';

const PALETTE = CarbonCategoricalDark14;

export const colorByPrivacy = (): ColorCoding => {

  const getStyle = () => (annotation: SupabaseAnnotation, selected?: boolean): DrawingStyle => {
    const color = annotation.visibility === Visibility.PRIVATE ?
      PALETTE[4] : PALETTE[7];

    return { fill: color, fillOpacity: selected ? 0.5: 0.24 };
  }

  const getLegend = () => [{
    color: PALETTE[4] , label: 'Your private annotations'
  }, {
    color: PALETTE[7] , label: 'All public annotations'
  }];

  const update = (annotations: SupabaseAnnotation[]) => getLegend();

  return { getLegend, getStyle, update };

}