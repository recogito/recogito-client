import type { SupabaseClient } from '@supabase/supabase-js';
import { getUser } from '@backend/auth';
import type { Response } from '@backend/Types';
import type { MyProfile } from 'src/Types';

export const getMyProfile = (supabase: SupabaseClient): Response<MyProfile> =>
  getUser(supabase).then(user =>
    supabase
      .from('profiles')
      .select()
      .eq('id', user?.id)
      .single()
      .then(({ error, data }) => ({ error, data: data as MyProfile })));

export const updateMyProfile = (supabase: SupabaseClient, values: {[key: string]: string}): Response<MyProfile> =>
  getUser(supabase).then(user =>
    supabase
      .from('profiles')
      .update(values)
      .eq('id', user?.id)
      .select()
      .single()
      .then(({ error, data }) => ({ error, data: data as MyProfile})));