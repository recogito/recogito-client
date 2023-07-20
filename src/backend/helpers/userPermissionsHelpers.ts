import type { SupabaseClient } from "@supabase/supabase-js";


export const getUserOrgRole = (supabase: SupabaseClient, id: string) => 
    supabase
        .from('group_users')
        .select('type_id')
        .eq('user_id', id)
        .eq('group_type', 'organization')
        .then(({ data, error }) => {
            if (data) {
                supabase
                    .from('organization_groups')
                    .select('name')
                    .in('role_id', data.map((i) => i.type_id))
                    .then(({ data, error}) => {
                        if (data) {
                            const roles = data.map((i) => i.name);
                            return ({ error, data: roles as string[] });
                        }
                        else return ({ error, data: undefined });
                    })
            }
            else return ({ error, data: undefined });
        });