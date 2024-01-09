import { Visibility, SupabaseAnnotation } from '@recogito/annotorious-supabase';
import type { FilterConfig, FilterConfigValue } from '../FilterConfig';

export const filterByPrivacy = (): FilterConfig => {

  let values = new Map([
    [ 'PRIVATE', true ],
    [ 'PUBLIC', true ]
  ]);

  const getFilter = () => (annotation: SupabaseAnnotation): boolean => {
    const privacy = annotation.visibility === Visibility.PRIVATE ? 'PRIVATE' : 'PUBLIC';
    return values.get(privacy)!;
  }

  const getValues = (): FilterConfigValue[] => 
    Array.from(values.entries()).map(([id, selected]) => ({ 
      id, selected,
      label: id === 'PRIVATE' 
        ? 'Your private annotations' 
        : 'All public annotations'
    }));

  const setValue = (id: string, selected: boolean)=> {
    values.set(id, selected);
    return { values: getValues(), filter: getFilter() };
  }

  const updateValues = (annotations: SupabaseAnnotation[]) => {
    // Do nothing
    return { values: getValues(), filter: getFilter() };
  }

  return { name: 'privacy', getValues, getFilter, setValue, updateValues };

}