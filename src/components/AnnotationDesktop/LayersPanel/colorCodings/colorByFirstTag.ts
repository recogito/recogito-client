import type { Color, Formatter, SupabaseAnnotation } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { shuffle, TailwindSequential17 } from '../ColorPalettes';

const PALETTE = shuffle(TailwindSequential17);

const NO_TAG: Color = '#727272';

export const colorByFirstTag = (): ColorCoding => {

  const assignedColors = new Map<string | undefined, Color>();

  const getNextAvailableColor = () =>
    PALETTE[assignedColors.size % PALETTE.length];

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter =>

    (annotation: SupabaseAnnotation, selected?: boolean) => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      const assignedColor = assignedColors.get(firstTag);
      if (assignedColor) {
        return { fill: assignedColor, fillOpacity: selected ? 0.45: 0.18 };
      } else {
        const color = firstTag ? getNextAvailableColor() : NO_TAG;
        assignedColors.set(firstTag, color);

        // New color assigned - update legend
        const legend = 
          Array.from(assignedColors.entries())
            .map(([ label, color ]) => ({ color, label: label || 'No tag' })); 

        // Sort tags alphabetically
        legend.sort((a, b) => a.label < b.label ? -1 : (a.label > b.label) ? 1 : 0);

        setLegend(legend);

        return { fill: color, fillOpacity: selected ? 0.45: 0.18 };
      }

    };

  return { createFormatter };

}