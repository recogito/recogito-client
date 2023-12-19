import type { PresentUser, Annotation } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';

export interface FilterConfig {

  getValues(): FilterConfigValue[];

  getFilter(): ((a: Annotation) => boolean);

  setValue(id: string, selected: boolean): { filter: ((a: Annotation) => boolean), values: FilterConfigValue[] };

  updateValues(annotations: SupabaseAnnotation[], present?: PresentUser[]): { filter: ((a: Annotation) => boolean), values: FilterConfigValue[] };

}

export interface FilterConfigValue {
  
  id: string, 

  label: string;

  selected: boolean;

}
