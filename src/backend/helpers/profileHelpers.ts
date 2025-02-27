import type { SupabaseClient } from '@supabase/supabase-js';
import type { ExtendedUserProfile, MyProfile } from 'src/Types';
import type { Response } from '@backend/Types';
import { getMyProfile } from '@backend/crud';

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

export const setProfileEULAAccepted = (
  supabase: SupabaseClient,
  userId: string
): Response<MyProfile> =>
  supabase
    .from('profiles')
    .update({ accepted_eula: true })
    .eq('id', userId)
    .then(() => getMyProfile(supabase));
