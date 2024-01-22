import type { Color, DrawingStyle } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Layer } from 'src/Types';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { ColorBrewerDark2_8 } from '../ColorPalettes';

const PALETTE = ColorBrewerDark2_8;

const NO_ASSIGNMENT: Color = '#727272';

export const colorByAssignment = (layers: Layer[]) => (): ColorCoding => {

  const legend = new Map(layers.map((layer, idx) => 
    ([layer.id, { color: PALETTE[idx], label: layer.context?.name || 'No Assignment' }])));

  const getStyle = () => (annotation: SupabaseAnnotation, selected?: boolean): DrawingStyle => {
    const assignedColor = legend.get(annotation.layer_id!);
    if (assignedColor) {
      return { fill: assignedColor.color, fillOpacity: selected ? 0.5 : 0.24 };
    } else {
      return { fill: NO_ASSIGNMENT, fillOpacity: selected ? 0.5 : 0.24 };
    }
  }

  const getLegend = () => 
    Array.from(legend.entries()).map(([_, { color, label }]) => ({ color, label } as ColorLegendValue));

  const update = (annotations: SupabaseAnnotation[]) => getLegend();

  return { name: 'assignment', getLegend, getStyle, update };

}