import { Visibility } from '@annotorious/react';
import type { Formatter, SupabaseAnnotation } from '@annotorious/react';
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

    return (annotation: SupabaseAnnotation) => {
      const color = annotation.visibility === Visibility.PRIVATE ?
        PALETTE[4] : PALETTE[7];

      return { fill: color, fillOpacity: 0.35 };
    };

  }

  return { createFormatter };


}