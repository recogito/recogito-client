import type { Color } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export interface ColorCoding {

  name: string;

  style: (a: SupabaseAnnotation) => Color;

  legend: ColorLegendValue[];

}

export interface ColorLegendValue {

  color: Color;
  
  label: string;

  className?: string

}