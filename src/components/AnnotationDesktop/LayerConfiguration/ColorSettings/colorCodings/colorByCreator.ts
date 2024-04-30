import type { AnnotationState, Color, DrawingStyle, PresentUser } from '@annotorious/react';
import type { ColorCoding, ColorLegendValue } from '../ColorCoding';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { getDisplayName, enumerateCreators } from '../../utils';
import type { AuthorColors } from '@components/AnnotationDesktop/AuthorColorProvider';

const UNKNOWN_CREATOR: Color = '#727272';

const buildLegend = (present: PresentUser[], annotations: SupabaseAnnotation[], colors: AuthorColors) => 
  new Map<string | undefined, { color: Color, label: string }>(new Map(
    enumerateCreators(present, annotations)
      .map((user, idx) => 
        ([user.id, { color: colors.getColor(user) as Color, label: getDisplayName(user) }]))
  ));

export const colorByCreator = (
  colors: AuthorColors
) => (annotations: SupabaseAnnotation[], present?: PresentUser[]): ColorCoding => {

  let legend = buildLegend(present || [], annotations, colors);

  const getStyle = () => (annotation: SupabaseAnnotation, state?: AnnotationState): DrawingStyle => {
    const creatorId = annotation.target.creator?.id;
    if (creatorId) {
      const assignedColor = legend.get(creatorId);
      if (assignedColor) {
        return { fill: assignedColor.color, fillOpacity: state?.selected ? 0.5: 0.24 };
      } else {
        return { fill: UNKNOWN_CREATOR, fillOpacity: state?.selected ? 0.5: 0.24 };
      }
    } else {
      return { fill: UNKNOWN_CREATOR, fillOpacity: state?.selected ? 0.45 : 0.14 };
    }
  }

  const getLegend = () => 
    Array.from(legend.entries()).map(([_, { color, label }]) => ({ color, label } as ColorLegendValue));

  const update = ( annotations: SupabaseAnnotation[], present: PresentUser[]): ColorLegendValue[] => {
    legend = buildLegend(present, annotations, colors);
    return getLegend();
  }

  return { name:'creator', getLegend, getStyle, update };

}