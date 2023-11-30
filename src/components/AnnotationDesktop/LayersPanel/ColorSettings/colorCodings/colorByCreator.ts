import type { Color, DrawingStyle, PresentUser, User } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

const PALETTE = AdobeCategorical12;

const UNKNOWN_CREATOR: Color = '#727272';

const enumerateCreators = (present: PresentUser[], annotations: SupabaseAnnotation[]) => 
  annotations.reduce((enumerated, a) => {
    const creator = present.find(p => p.id === a.target.creator?.id || a.target.creator);
    if (creator) {
      const exists = enumerated.find(u => u.id === creator.id);
      return exists ? enumerated : [...enumerated, creator];
    } else {
      return enumerated;
    }
  }, [] as User[]);

const getName = (user?: PresentUser | User) => {
  if (user) {
    return 'appearance' in user ? 
      (user as PresentUser).appearance.label : user.name || 'Anonymous';
  } else {
    return 'Anonymous';
  }
}

const buildLegend = (present: PresentUser[], annotations: SupabaseAnnotation[]) => 
  new Map<string | undefined, { color: Color, label: string }>(new Map(
    enumerateCreators(present, annotations)
      .map((user, idx) => ([user.id, { color: PALETTE[idx], label: getName(user) }]))
  ));

export const colorByCreator = (annotations: SupabaseAnnotation[], present?: PresentUser[]): ColorCoding => {

  let legend = buildLegend(present || [], annotations);

  const getStyle = () => (annotation: SupabaseAnnotation, selected?: boolean): DrawingStyle => {
    const creatorId = annotation.target.creator?.id;
    if (creatorId) {
      const assignedColor = legend.get(creatorId);
      if (assignedColor) {
        return { fill: assignedColor.color, fillOpacity: selected ? 0.5: 0.24 };
      } else {
        return { fill: UNKNOWN_CREATOR, fillOpacity: selected ? 0.5: 0.24 };
      }
    } else {
      return { fill: UNKNOWN_CREATOR, fillOpacity: selected ? 0.45 : 0.14 };
    }
  }

  const getLegend = () => 
    Array.from(legend.entries()).map(([_, { color, label }]) => ({ color, label } as ColorLegendValue));

  const update = ( annotations: SupabaseAnnotation[], present: PresentUser[]): ColorLegendValue[] => {
    legend = buildLegend(present, annotations);
    return getLegend();
  }

  return { getLegend, getStyle, update };

}