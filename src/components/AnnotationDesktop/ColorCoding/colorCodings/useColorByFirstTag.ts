import { useMemo } from 'react';
import { useAnnotations, type Color } from '@annotorious/react';
import type { ColorCoding } from '../ColorCoding';
import {
  AdobeCategorical12,
  createPalette,
  enumerateTags,
} from '@recogito/studio-sdk';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { VocabularyTerm } from 'src/Types';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

export const useColorByFirstTag = (vocabulary: VocabularyTerm[] = []): ColorCoding => {

  const annotations = useAnnotations(500);

  const tags = useMemo(() => enumerateTags(annotations), [annotations]);

  const getColor = useMemo(() => {
    const palette = createPalette(PALETTE);

    const getColorFn = (tag: string)  => {
      const preset = vocabulary.find(t => t.label === tag)?.color as Color;
      return preset || palette.getColor(tag);
    }

    return getColorFn;
  }, [vocabulary]);

  const style = useMemo(() => {
    return (annotation: SupabaseAnnotation): Color => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        // For backwards-compatibility: support object and string tags
        const label = firstTag.startsWith('{') ? JSON.parse(firstTag).label : firstTag;
        return getColor(label);
      } else {
        return NO_TAG;
      }
    }
  }, [getColor]);

  const legend = useMemo(() => {
    return tags.map(tag => ({ color: getColor(tag.label) as Color, label: tag.label }));
  }, [getColor, tags]);

  return useMemo(() => ({ name: 'tag', style, legend }), [style, legend]);

}
