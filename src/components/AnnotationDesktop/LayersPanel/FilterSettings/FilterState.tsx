import { ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useAnnotations, type PresentUser} from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { FilterConfig, FilterConfigValue } from './FilterConfig';

interface FilterStateContextValue {

  filter?: (a: SupabaseAnnotation) => boolean;

  values: FilterConfigValue[];

  setConfig(fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => FilterConfig): void; 

  setValue(id: string, selected: boolean): void;

}

// @ts-ignore
const FilterStateContext = createContext<FilterStateContextValue>(); 

interface FilterStateProps {

  children: ReactNode;

  present: PresentUser[];

}

export const FilterState = (props: FilterStateProps) => {

  const [config, _setConfig] = useState<FilterConfig | undefined>();

  const [filter, setFilter] = useState<((a: SupabaseAnnotation) => boolean) | undefined>();

  const [values, setValues] = useState<FilterConfigValue[]>([]);

  const annotations = useAnnotations();

  const setConfig = (fn?: (annotations: SupabaseAnnotation[], present?: PresentUser[]) => FilterConfig) => {
    if (fn) {
      const config = fn(annotations, props.present);
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
      const { values, filter } = config.updateValues(annotations, props.present);
      setValues(values);
      setFilter(() => filter);
    }
  }, [annotations, props.present]);

  const setValue = (id: string, selected: boolean) => {
    if (config) {
      const { values, filter } = config.setValue(id, selected);
      setValues(values);
      setFilter(() => filter);
    }
  }

  return (
    <FilterStateContext.Provider value={{ filter, values, setConfig, setValue }}>
      {props.children}
    </FilterStateContext.Provider>
  )

}

export const useFilterSettings = () => useContext(FilterStateContext);
