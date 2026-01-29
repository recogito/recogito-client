import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Job, JobType } from 'src/Types';

export const createJob = (
  supabase: SupabaseClient,
  name: string,
  jobType: JobType
): Response<Job> =>
  supabase
    .from('jobs')
    .insert({
      name,
      job_type: jobType,
      bucket_id: 'jobs'
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Job }));

export const deleteJob = (
  supabase: SupabaseClient,
  id: string
): Response<any> =>
  supabase
    .from('jobs')
    .delete()
    .match({ id })
    .select()
    .then(({ error, data }) => ({ error, data }))

export const getJob = (
  supabase: SupabaseClient,
  id: string
): Response<Job> =>
  supabase
    .from('jobs')
    .select()
    .match({ id })
    .single()
    .then(({ error, data }) => ({ error, data: data as Job }));

export const getJobs = (
  supabase: SupabaseClient
): Response<Job[]> =>
  supabase
    .from('jobs')
    .select(`
      id,
      name,
      job_status,
      job_type,
      created_at,
      created_by:profiles!jobs_created_by_fkey(
        id,
        nickname,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .order('created_at', { ascending: false })
    .then(({ error, data }) => ({ error, data: data as unknown as Job[] }));

export const updateJob = (
  supabase: SupabaseClient,
  partial: { id: string; [key: string]: string | null }
): Response<Job> =>
  supabase
    .from('jobs')
    .update({ ...partial })
    .eq('id', partial.id)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Job }));