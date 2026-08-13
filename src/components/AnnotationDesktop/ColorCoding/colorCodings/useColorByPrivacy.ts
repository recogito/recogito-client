import { useCallback, useMemo } from 'react';
import type { Color } from '@annotorious/react';
import { Visibility, type SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { CarbonCategoricalDark14 } from '../ColorPalettes';
import type { ColorCoding } from '../ColorCoding';

const PALETTE = CarbonCategoricalDark14;

const legend = [{
  color: PALETTE[7] , label: 'All public annotations'
}, {
  color: PALETTE[4] , label: 'Your private annotations'
}];

export const useColorByPrivacy = (): ColorCoding => {

  const style = useCallback((annotation: SupabaseAnnotation): Color => {
    const color = annotation.visibility === Visibility.PRIVATE ?
      PALETTE[4] : PALETTE[7];

    return color;
  }, []);
  
  return useMemo(() => ({ name: 'privacy', style, legend }), [style]);

}