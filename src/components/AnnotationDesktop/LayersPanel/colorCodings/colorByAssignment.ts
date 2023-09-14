import type { Color, Formatter, SupabaseAnnotation } from '@annotorious/react';
import type { Layer } from 'src/Types';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { ColorBrewerDark2_8 } from '../ColorPalettes';

const PALETTE = ColorBrewerDark2_8;

export const colorByAssignment = (layers: Layer[]): ColorCoding => {

  const assignedColors = new Map<string, Color>();

  // Resolves layer ID to context name
  const getLabel = (layerId: string) =>
    layers?.find(l => l.id === layerId)?.context.name;

  const getNextAvailableColor = () =>
    PALETTE[assignedColors.size % PALETTE.length];

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter =>

    (annotation: SupabaseAnnotation) => {
      const assignedColor = assignedColors.get(annotation.layer_id!);
      if (assignedColor) {
        return { fill: assignedColor, fillOpacity: 0.25 };
      } else {
        const color = getNextAvailableColor();
        assignedColors.set(annotation.layer_id!, color);

        // New color assigned - update legend
        const legend = 
          Array.from(assignedColors.entries())
            .map(([ id, color ]) => { 
              // Assignment name or undefined for default context
              const label = getLabel(id);

              const className = label ? undefined : 'default-value';

              return { color, label: label || 'Other', className };
            });

        // TODO sort the legend so that the default value is always at the bottom

        setLegend(legend);

        return { fill: color, fillOpacity: 0.25 };
      }
    };

  return { createFormatter };

}