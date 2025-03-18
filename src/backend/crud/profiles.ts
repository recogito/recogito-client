import type { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { getUser } from '@backend/auth';
import type { Response } from '@backend/Types';
import type { MyProfile } from 'src/Types';

export const getMyProfile = (supabase: SupabaseClient): Response<MyProfile> =>
  getUser(supabase)
    .then((user) =>
      supabase
        .from('profiles')
        .select(
          `
          id,
          created_at,
          nickname,
          first_name,   
          last_name,
          avatar_url,
          accepted_eula,
          group_users!group_users_user_id_fkey(
            group_type,
            type_id
          )
        `
        )
        .eq('id', user?.id)
        .eq('group_users.group_type', 'organization')
        .single()
        .then(({ error, data }) => {
          if (error) {
            return { error, data: data as unknown as MyProfile };
          } else {
            // Keep profile fields + add email
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { group_users, ...profile } = { ...data, email: user.email };

            return supabase
              .from('organization_groups')
              .select(
                `
                id,
                name,
                description,
                is_admin
              `
              )
              .in(
                'id',
                data.group_users.map((r) => r.type_id)
              )
              .then(({ error, data }) => {
                if (error) {
                  return { error, data: data as unknown as MyProfile };
                } else {
                  return {
                    error,
                    data: {
                      ...profile,
                      isOrgAdmin: data.some((r) => r.is_admin === true),
                    } as MyProfile,
                  };
                }
              });
          }
        })
    )
    .catch((error) => ({
      error: error as PostgrestError,
      data: null as unknown as MyProfile,
    }));

export const updateMyProfile = (
  supabase: SupabaseClient,
  values: { [key: string]: string }
): Response<MyProfile> =>
  getUser(supabase).then((user) =>
    supabase
      .from('profiles')
      .update(values)
      .eq('id', user?.id)
      .select()
      .single()
      .then(({ error, data }) => ({ error, data: data as MyProfile }))
  );
