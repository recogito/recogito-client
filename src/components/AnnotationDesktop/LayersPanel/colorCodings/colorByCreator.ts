import type { Annotation, Color, Formatter, PresentUser, SupabaseAnnotation, User } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';

const PALETTE = AdobeCategorical12;

const UNKNOWN_CREATOR: Color = '#727272';

// TODO resolve against present users!
export const colorByCreator = (present: PresentUser[]): ColorCoding => {

  const assignedColors = new Map<string, Color>();

  const getName = (userId: string, annotation: Annotation) => {
    const creator: PresentUser | User = present.find(p => p.id === userId) || 
      annotation.target.creator!; 

    return 'appearance' in creator ? 
      (creator as PresentUser).appearance.label : creator.name || 'Anonymous';
  }

  const getNextAvailableColor = () =>
    PALETTE[assignedColors.size % PALETTE.length];

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter =>

    (annotation: SupabaseAnnotation) => {
      const creatorId = annotation.target.creator?.id;

      if (creatorId) {
        const assignedColor = assignedColors.get(creatorId);
        if (assignedColor) {
          return { fill: assignedColor, fillOpacity: 0.25 };
        } else {
          const color = getNextAvailableColor();
          assignedColors.set(creatorId, color);

          // New color assigned - update legend
          // TODO resolve IDs against present users
          const legend = 
            Array.from(assignedColors.entries())
              .map(([ userId, color ]) => ({ color, label: getName(userId, annotation) })); 

          // Sort names alphabetically
          legend.sort((a, b) => a.label < b.label ? -1 : (a.label > b.label) ? 1 : 0);

          setLegend(legend);

          return { fill: color, fillOpacity: 0.25 };
        }
      } else {
        return { fill: UNKNOWN_CREATOR, fillOpacity: 0.25 };
      }
    };

  return { createFormatter };

}