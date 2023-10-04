import { Visibility, SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Formatter } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { CarbonCategoricalDark14 } from '../ColorPalettes';

const PALETTE = CarbonCategoricalDark14;

export const colorByPrivacy = (): ColorCoding => {

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter => {
    setLegend([{
      color: PALETTE[4] , label: 'Your private annotations'
    }, {
      color: PALETTE[7] , label: 'All public annotations'
    }])

    return (annotation: SupabaseAnnotation, selected?: boolean) => {
      const color = annotation.visibility === Visibility.PRIVATE ?
        PALETTE[4] : PALETTE[7];

      return { fill: color, fillOpacity: selected ? 0.45: 0.14 };
    };

  }

  return { createFormatter };


}