import type { AnnotationBody, Color, DrawingStyle } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../useColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { enumerateTags } from '../../utils';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

const buildLegend = (annotations: SupabaseAnnotation[]) => 
  new Map<string | undefined, Color>(new Map(
    enumerateTags(annotations).map((tag, idx) => ([tag, PALETTE[idx]]))
  ));

export const colorByFirstTag = (annotations: SupabaseAnnotation[]): ColorCoding => {

  let legend = buildLegend(annotations);

  const getStyle = () => (annotation: SupabaseAnnotation, selected?: boolean): DrawingStyle => {
    const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;
    const assignedColor = legend.get(firstTag);
    if (assignedColor) {
      return { fill: assignedColor, fillOpacity: selected ? 0.5: 0.24 };
    } else {
      return { fill: NO_TAG, fillOpacity: selected ? 0.5: 0.24 };
    }
  };

  const getLegend = () => 
    Array.from(legend.entries()).map(([tag, value]) => ({ color: value, label: tag } as ColorLegendValue));

  const update = (annotations: SupabaseAnnotation[]): ColorLegendValue[] => {
    legend = buildLegend(annotations);
    return getLegend();
  }

  return { getLegend, getStyle, update };

}