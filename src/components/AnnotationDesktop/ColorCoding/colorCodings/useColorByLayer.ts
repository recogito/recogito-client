import { useMemo } from 'react';
import type { AnnotationState, Color, DrawingStyle } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { ColorCoding } from '../ColorCoding';
import { ColorBrewerDark2_8 } from '../ColorPalettes';
import { createPalette } from './utils';
import type { DocumentLayer } from 'src/Types';

const PALETTE = ColorBrewerDark2_8;

const NO_LAYER: Color = '#727272';

export const userColorByLayer = (
  layers: DocumentLayer[] | undefined, 
  layerNames: Map<string, string>
): ColorCoding => {

  const { getColor } = useMemo(() => createPalette(PALETTE), []);

  const style = useMemo(() => {
    return (annotation: SupabaseAnnotation, state?: AnnotationState): DrawingStyle => {
      const layerId = annotation.layer_id;

      if (layerId) {
        return { fill: getColor(layerId), fillOpacity: state?.selected ? 0.5: 0.24 };
      } else {
        // Shouldn't happen unless in case of integrity error
        return { fill: NO_LAYER, fillOpacity: state?.selected ? 0.5: 0.24 };
      }
    }
  }, [getColor]);

  const legend = useMemo(() => (
    layers 
      ? layers.map(l => ({ color: getColor(l.id) as Color, label: layerNames.get(l.id) || 'Baselayer' })) 
      : []
  ), [layers, layerNames, getColor]);

  return { name: 'layers', style, legend };

}