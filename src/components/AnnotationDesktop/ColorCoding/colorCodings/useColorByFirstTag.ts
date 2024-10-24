import { useMemo } from 'react';
import { useAnnotations, type Color } from '@annotorious/react';
import { enumerateTags } from '@components/AnnotationDesktop';
import { AdobeCategorical12 } from '../ColorPalettes';
import type { ColorCoding } from '../ColorCoding';
import { createPalette } from './utils';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { VocabularyTerm } from 'src/Types';

const PALETTE = AdobeCategorical12;

const NO_TAG: Color = '#727272';

export const useColorByFirstTag = (vocabulary: VocabularyTerm[] = []): ColorCoding => {

  const annotations = useAnnotations(500);

  const tags = useMemo(() => enumerateTags(annotations), [annotations]);

  const getColor = useMemo(() => {
    const palette = createPalette(PALETTE);

    const getColor = (tag: string)  => {
      const preset = vocabulary.find(t => t.label === tag)?.color as Color;
      return preset || palette.getColor(tag);
    }

    return getColor;
  }, [vocabulary, tags.join('-')]);

  const style = useMemo(() => {
    return (annotation: SupabaseAnnotation): Color => {
      const firstTag = annotation.bodies.find(b => b.purpose === 'tagging')?.value;

      if (firstTag) {
        return getColor(firstTag);
      } else {
        return NO_TAG;
      }
    }
  }, [getColor]);

  const legend = useMemo(() => {
    return tags.map(tag => ({ color: getColor(tag) as Color, label: tag }));
  }, [tags]);

  return { name: 'tag', style, legend }; 

}
