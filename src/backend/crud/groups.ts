import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Group } from 'src/Types';

export const getOrgGroups = (supabase: SupabaseClient): Response<Group[]> =>
  supabase
    .from('organization_groups')
    .select()
    .then(({ error, data }) => ({ error, data: data as Group[] }));
