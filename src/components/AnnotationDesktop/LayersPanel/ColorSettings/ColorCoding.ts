import type { Color, DrawingStyle, PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export interface ColorCoding {

  name: string;

  getStyle(): ((a: SupabaseAnnotation, selected?: boolean) => DrawingStyle);

  getLegend(): ColorLegendValue[];

  update(annotations: SupabaseAnnotation[], present?: PresentUser[]): ColorLegendValue[];

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}