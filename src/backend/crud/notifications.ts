import type { SupabaseClient } from '@supabase/supabase-js';
import type { Invitation } from 'src/Types';
import type { Response } from '@backend/Types';
import { getUser } from '@backend/auth';

export const listMyInvites = (supabase: SupabaseClient): Response<Invitation[]> =>
    getUser(supabase).then(user => 
        supabase
            .from('invites')
            .select(`
                id,
                ignored,
                invited_by_name,
                project_name
            `)
            .is('accepted', false)
            .eq('email', user?.email)
            .then(({ error, data }) => ({ error, data: data as Invitation[] })));


export const processAcceptInvite = (supabase: SupabaseClient, id: string) =>
        supabase
            .from('invites')
            .update({ accepted: true })
            .eq('id', id)
            .then(({ error, data }) => { error && console.log(error); return ({ error, data })});

export const processIgnoreInvite = (supabase: SupabaseClient, id: string) =>
        supabase
            .from('invites')
            .update({ ignored: true })
            .eq('id', id)
            .then(({ error, data }) => ({ error, data }));

export const processUnignoreInvite = (supabase: SupabaseClient, id: string) =>
        supabase
            .from('invites')
            .update({ ignored: false })
            .eq('id', id)
            .then(({ error, data }) => ({ error, data }));
