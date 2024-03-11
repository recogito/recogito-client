import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExtendedUserProfile } from 'src/Types';
import type { Response } from '@backend/Types';

export const getProfilesExtended = (
  supabase: SupabaseClient
): Response<ExtendedUserProfile[]> =>
  supabase.rpc('get_profiles_extended').then(async ({ error, data }) => {
    if (error) {
      return { error, data: [] };
    } else {
      return { error, data: data };
    }
  });
