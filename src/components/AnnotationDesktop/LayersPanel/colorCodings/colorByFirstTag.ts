import type { Color, Formatter, SupabaseAnnotation } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

export const colorByFirstTag = (): ColorCoding => {

  const assignedColors = new Map<string, Color>();

  const getNextAvailableColor = () =>
    PALETTE[assignedColors.size % PALETTE.length];

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter =>

    (annotation: SupabaseAnnotation) => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        const assignedColor = assignedColors.get(firstTag);
        if (assignedColor) {
          return { fill: assignedColor, fillOpacity: 0.25 };
        } else {
          const color = getNextAvailableColor();
          assignedColors.set(firstTag, color);

          // New color assigned - update legend
          const legend = 
            Array.from(assignedColors.entries())
              .map(([ label, color ]) => ({ color, label })); 

          // Sort tags alphabetically
          legend.sort((a, b) => a.label < b.label ? -1 : (a.label > b.label) ? 1 : 0);

          setLegend(legend);

          return { fill: color, fillOpacity: 0.25 };
        }
      } else {
        return { fill: NO_TAG, fillOpacity: 0.25 };
      }
    };

  return { createFormatter };

}