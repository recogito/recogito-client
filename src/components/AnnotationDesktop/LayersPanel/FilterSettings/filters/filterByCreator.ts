import type { PresentUser } from '@annotorious/react';
import type { SupabaseAnnotation } from '@recogito/annotorious-supabase';
import { enumerateCreators, getDisplayName } from '../../utils';
import type { FilterConfig, FilterConfigValue } from '../useFiltering';

const buildOptions = (present: PresentUser[], annotations: SupabaseAnnotation[]) => 
  new Map<string | undefined, { label: string, selected: boolean }>(new Map(
    enumerateCreators(present, annotations)
      .map(user => ([user.id, { label: getDisplayName(user), selected: true }]))
  ));

export const filterByCreator = (annotations: SupabaseAnnotation[], present?: PresentUser[]): FilterConfig => {

  let options = buildOptions(present || [], annotations);
  
  const getFilter = () => (annotation: SupabaseAnnotation): boolean => {
    const creatorId = annotation.target.creator?.id;
    if (creatorId) {
      const setting = options.get(creatorId);
      return setting ? setting.selected : false;
    } else {
      return false;
    }
  }

  const getValues = (): FilterConfigValue[] => 
    Array.from(options.entries()).map(([_, label]) => label);

  const updateValues = (annotations: SupabaseAnnotation[], present: PresentUser[]) => {
    options = buildOptions(present, annotations);
    return getValues();
  }

  return { getValues, getFilter, updateValues };

}