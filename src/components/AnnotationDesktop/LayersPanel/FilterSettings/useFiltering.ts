import { useEffect, useState } from 'react';
import { useAnnotations, type PresentUser, Annotation } from '@annotorious/react';
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

export const useFiltering = (initial: PresentUser[]) => {

  const [config, _setConfig] = useState<FilterConfig | undefined>();

  const [filter, setFilter] = useState<((a: SupabaseAnnotation) => boolean) | undefined>();

  const [values, setValues] = useState<FilterConfigValue[]>([]);

  const [present, setPresent] = useState<PresentUser[]>(initial);

  const annotations = useAnnotations();

  const setConfig = (fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => FilterConfig) => {
    if (fn) {
      const config = fn(annotations, present);
      _setConfig(config);
      setFilter(() => config.getFilter());
      setValues(config.getValues());
    } else {
      _setConfig(undefined);
      setFilter(undefined);
      setValues([]);
    }
  }

  useEffect(() => {
    if (config) {
      const { values, filter } = config.updateValues(annotations, present);
      setValues(values);
      setFilter(() => filter);
    }
  }, [annotations, present]);

  const setValue = (id: string, selected: boolean) => {
    if (config) {
      const { values, filter } = config.setValue(id, selected);
      setValues(values);
      setFilter(() => filter);
    }
  }

  return { filter, values, setConfig, setPresent, setValue };

}