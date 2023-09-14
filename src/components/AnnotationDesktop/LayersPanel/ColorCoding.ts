import { useState } from 'react';
import type { Color, Formatter } from '@annotorious/react';

export interface ColorCoding {

  createFormatter(setLegend: (legend: ColorLegendValue[]) => void): Formatter;

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}

export const useColorCoding = () => {

  const [legend, setLegend] = useState<ColorLegendValue[]>([]);

  const [formatter, setFormatter] = useState<Formatter | undefined>();

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