import type { AnnotationBody, Color, DrawingStyle } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

/** Creates an ordered list of tags by time of first creation */
const enumerateTags = (annotations: SupabaseAnnotation[]) => 
  annotations.reduce((enumerated, annotation) => {
    const tags = annotation.bodies.filter(b => b.purpose === 'tagging');
    return [...enumerated, ...tags];
  }, [] as AnnotationBody[])
  .sort((a, b) => a.created! > b.created! ? 1 : -1)
  .reduce((firstOccurrences, body) => {
    if (body.value) {
      return firstOccurrences.indexOf(body.value) < 0 ? [...firstOccurrences, body.value] : firstOccurrences;
    } else {
      return firstOccurrences;
    }
  }, [] as string[]);

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