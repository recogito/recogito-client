import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { FilterConfig, FilterConfigValue } from '../FilterConfig';
import { enumerateTags } from '../../utils';

const buildValues = (annotations: SupabaseAnnotation[]) => 
  new Map<string, boolean>(new Map(
    enumerateTags(annotations).map((tag, idx) => ([tag, true]))
  ));

export const filterByTag = (annotations: SupabaseAnnotation[]): FilterConfig => {

  let values = buildValues(annotations);

  const getFilter = () => (annotation: SupabaseAnnotation): boolean => {
    const tags = annotation.bodies.filter(b => b.purpose === 'tagging' && b.value).map(b => b.value);
    return tags.some(tag => values.get(tag!));
  }

  const getValues = (): FilterConfigValue[] => 
    Array.from(values.entries()).map(([tag, selected]) => ({ id: tag, label: tag, selected }));

  const setValue = (id: string, selected: boolean)=> {
    values.set(id, selected);
    return { values: getValues(), filter: getFilter() };
  }

  const updateValues = (annotations: SupabaseAnnotation[]) => {
    const next = buildValues(annotations);

    Array.from(values.entries()).forEach(([id, selected]) =>
      next.set(id, selected));

    values = next;

    return { values: getValues(), filter: getFilter() };

  }

  return { name: 'tag', getValues, getFilter, setValue, updateValues };

}