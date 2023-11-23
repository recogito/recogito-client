import { useEffect, useState } from 'react';
import { useAnnotations } from '@annotorious/react';
import type { Color, DrawingStyle, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export interface ColorCoding {

  getStyle(): ((a: SupabaseAnnotation, selected?: boolean) => DrawingStyle);

  getLegend(): ColorLegendValue[];

  update(annotations: SupabaseAnnotation[], present?: PresentUser[]): ColorLegendValue[];

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}

export const useColorCoding = (initial: PresentUser[]) => {

  const [coding, _setCoding] = useState<ColorCoding | undefined>();

  const [style, setStyle] = useState<((a: SupabaseAnnotation) => DrawingStyle) | undefined>();

  const [legend, setLegend] = useState<ColorLegendValue[]>([]);

  const [present, setPresent] = useState<PresentUser[]>(initial);

  const annotations = useAnnotations();

  const setCoding = (fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => ColorCoding) => {
    if (fn) {
      const coding = fn(annotations, present);
      _setCoding(coding);
      setStyle(() => coding.getStyle());
      setLegend(coding.getLegend());
    } else {
      _setCoding(undefined);
      setStyle(undefined);
      setLegend([]);
    }
  }

  useEffect(() => {
    if (coding) {
      const legend = coding.update(annotations, present);
      setLegend(legend);
    }
  }, [annotations, present]);

  return { style, legend, setCoding, setPresent };

}