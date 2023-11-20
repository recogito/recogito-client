import { useState } from 'react';
import type { Color, DrawingStyle } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export interface ColorCoding {

  createFormatter(setLegend: (legend: ColorLegendValue[]) => void): ((a: SupabaseAnnotation) => DrawingStyle);

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}

export const useColorCoding = () => {

  const [legend, setLegend] = useState<ColorLegendValue[]>([]);

  const [formatter, setFormatter] = useState<((a: SupabaseAnnotation) => DrawingStyle) | undefined>();

  const setCoding = (coding?: ColorCoding) => {
    if (coding) {
      const formatter = coding.createFormatter(setLegend);
      setFormatter(() => formatter);
    } else {
      setLegend([]);
      setFormatter(undefined);
    }
  }

  return { formatter, legend, setCoding };

}