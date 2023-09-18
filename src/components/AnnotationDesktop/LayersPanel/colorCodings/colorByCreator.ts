import type { Annotation, Color, Formatter, PresentUser, SupabaseAnnotation, User } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';

const PALETTE = AdobeCategorical12;

const UNKNOWN_CREATOR: Color = '#727272';

export const colorByCreator = (present: PresentUser[]): ColorCoding => {

  const assignedColors = new Map<string, { color: Color, creator: PresentUser | User | undefined }>();

  const getCreator = (a: Annotation): PresentUser | User | undefined =>
    present.find(p => p.id === a.target.creator?.id) || 
      a.target.creator;

  const getName = (user?: PresentUser | User) => {
    if (user) {
      return 'appearance' in user ? 
        (user as PresentUser).appearance.label : user.name || 'Anonymous';
    } else {
      return 'Anonymous';
    }
  }

  const getNextAvailableColor = () =>
    PALETTE[assignedColors.size % PALETTE.length];

  const createFormatter = (setLegend: (legend: ColorLegendValue[]) => void): Formatter =>

    (annotation: SupabaseAnnotation, selected?: boolean) => {
      const creatorId = annotation.target.creator?.id;

      if (creatorId) {
        const assignedColor = assignedColors.get(creatorId)?.color;
        if (assignedColor) {
          return { fill: assignedColor, fillOpacity: selected ? 0.45 : 0.14 };
        } else {
          const color = getNextAvailableColor();
          const creator = getCreator(annotation);
          assignedColors.set(creatorId, { color, creator });

          const legend = 
            Array.from(assignedColors.entries())
              .map(([ _, { color, creator } ]) => ({ color, label: getName(creator) })); 

          // Sort names alphabetically
          legend.sort((a, b) => a.label < b.label ? -1 : (a.label > b.label) ? 1 : 0);

          setLegend(legend);

          return { fill: color, fillOpacity: selected ? 0.45 : 0.14 };
        }
      } else {
        return { fill: UNKNOWN_CREATOR, fillOpacity: selected ? 0.45 : 0.14 };
      }
    };

  return { createFormatter };

}