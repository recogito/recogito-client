import type { SupabaseClient } from '@supabase/supabase-js';
import type { Invitation } from 'src/Types';
import type { Response } from '@backend/Types';
import { getUser } from '@backend/auth';

export const listMyInvites = (supabase: SupabaseClient): Response<Invitation[]> =>
    getUser(supabase).then(user => 
        supabase
            .from('invites')
            .select(`
                id
            `)
            .is('accepted', false)
            .is('ignored', false)
            .then(({ error, data }) => ({ error, data: data as Invitation[] })));


export const processAcceptInvite = (supabase: SupabaseClient, id: string) =>
        supabase
            .from('invites')
            .update({ accepted: true })
            .eq('id', id)
            .then(({ error, data }) => ({ error, data }));

export const processIgnoreInvite = (supabase: SupabaseClient, id: string) =>
        supabase
            .from('invites')
            .update({ ignored: true })
            .eq('id', id)
            .then(({ error, data }) => ({ error, data }));
