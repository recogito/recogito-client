import type { PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { enumerateCreators, getDisplayName } from '../../utils';
import type { FilterConfig, FilterConfigValue } from '../FilterConfig';

const buildValues = (annotations: SupabaseAnnotation[], present: PresentUser[] = []) => 
  new Map<string, { label: string, selected: boolean }>(new Map(
    enumerateCreators(present, annotations)
      .map(user => ([user.id, { label: getDisplayName(user), selected: true }]))
  ));

export const filterByCreator = (annotations: SupabaseAnnotation[], present?: PresentUser[]): FilterConfig => {

  let values = buildValues(annotations, present);
  
  const getFilter = () => (annotation: SupabaseAnnotation): boolean => {
    const creatorId = annotation.target.creator?.id;
    if (creatorId) {
      const setting = values.get(creatorId);
      return setting ? setting.selected : false;
    } else {
      return false;
    }
  }

  const getValues = (): FilterConfigValue[] => 
    Array.from(values.entries()).map(([id, { label, selected }]) => ({ id, label, selected }));

  const setValue = (id: string, selected: boolean)=> {
    const entry = values.get(id);

    if (entry)
      values.set(id, { label: entry.label , selected });

    return { values: getValues(), filter: getFilter() };
  }

  const updateValues = (annotations: SupabaseAnnotation[], present?: PresentUser[]) => {
    const next = buildValues(annotations, present);

    Array.from(values.entries()).forEach(([id, { selected }]) => {
      const existing = next.get(id);
      if (existing)
        next.set(id, { label: existing.label, selected });
    });

    values = next;

    return { values: getValues(), filter: getFilter() };
  }

  return { name: 'creator', getValues, getFilter, setValue, updateValues };

}