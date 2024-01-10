import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAnnotations, type PresentUser, DrawingStyle} from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { ColorCoding, ColorLegendValue } from './ColorCoding';

interface ColorStateContextValue {

  name?: string;

  style?: ((a: SupabaseAnnotation) => DrawingStyle);

  legend: ColorLegendValue[];

  setCoding(fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => ColorCoding): void;

}

// @ts-ignore
const ColorStateContext = createContext<ColorStateContextValue>(); 

interface ColorStateProps {

  children: ReactNode;

  present: PresentUser[];

}

export const ColorState = (props: ColorStateProps) => {

  const [coding, _setCoding] = useState<ColorCoding | undefined>();

  const [style, setStyle] = useState<((a: SupabaseAnnotation) => DrawingStyle) | undefined>();

  const [legend, setLegend] = useState<ColorLegendValue[]>([]);

  const annotations = useAnnotations();

  const setCoding = (fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => ColorCoding) => {
    if (fn) {
      const coding = fn(annotations, props.present);
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
      const legend = coding.update(annotations, props.present);
      setLegend(legend);
    }
  }, [annotations, props.present]);

  return (
    <ColorStateContext.Provider value={{ name: coding?.name, style, legend, setCoding }}>
      {props.children}
    </ColorStateContext.Provider>
  )

}

export const useColorCoding = () => useContext(ColorStateContext);
