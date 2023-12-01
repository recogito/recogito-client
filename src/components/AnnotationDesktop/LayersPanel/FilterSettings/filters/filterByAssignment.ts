import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { Layer } from 'src/Types';
import type { FilterConfig, FilterConfigValue } from '../FilterConfig';

const buildValues = (layers: Layer[]) => 
  new Map(layers.map((layer, idx) => 
    ([layer.id, { label: layer.context?.name || 'No Assignment', selected: true }])));

export const filterByAssignment = (layers: Layer[]) => (): FilterConfig => {

  const values = buildValues(layers);

  const getFilter = () => (annotation: SupabaseAnnotation): boolean =>
    Boolean(values.get(annotation.layer_id!)?.selected);

  const getValues = (): FilterConfigValue[] => 
    Array.from(values.entries()).map(([id, { label, selected }]) => ({ id, label, selected }));

  const setValue = (id: string, selected: boolean)=> {
    const entry = values.get(id);

    if (entry)
      values.set(id, { label: entry.label , selected });

    return { values: getValues(), filter: getFilter() };
  }
  
  const updateValues = (annotations: SupabaseAnnotation[]) => {
    // Do nothing
    return { values: getValues(), filter: getFilter() };
  }

  return { getValues, getFilter, setValue, updateValues };

}