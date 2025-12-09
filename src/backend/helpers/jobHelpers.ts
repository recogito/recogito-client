import { createJob } from '@backend/crud';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Project } from 'src/Types.ts';

const upload = async (
  supabase: SupabaseClient,
  name: string,
  file: File
) => {
  supabase
    .storage
    .from('jobs')
    .upload(name, file)
};

export const exportProject = (
  supabase: SupabaseClient,
  project: Project
): Promise<boolean> => new Promise((resolve) => {
  createJob(supabase, project.name, 'EXPORT')
    .then(({ data }) => runJob(supabase, data.id, { projectId: project.id }))
    .then((success) => resolve(success))
});

export const importProject = (
  supabase: SupabaseClient,
  file: File
): Promise<boolean> => new Promise((resolve) => {
  createJob(supabase, 'Import Project', 'IMPORT')
    .then(async ({ data }) => {
      await upload(supabase, data.id, file);
      return await runJob(supabase, data.id);
    })
    .then(resolve)
});

export const runJob = (
  supabase: SupabaseClient,
  jobId: string,
  params?: { [key: string]: string }
): Promise<boolean> =>
  supabase.auth.getSession().then(({ error, data }) => {
    // Get Supabase session token first
    if (error) {
      // Shouldn't really happen at this point
      console.log(error);
      return false;
    }
    const token = data.session?.access_token;
    if (!token) {
      // Shouldn't really happen at this point
      console.log('Not authorized');
      return false;
    }
    // Call the invite-user endpoint
    return fetch(`/api/run-job`, {
      method: 'POST',
      headers: {
        // Storage proxy requires authentication
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ jobId, ...params }),
    }).then((resp) => {
      if (resp.ok) {
        return true;
      }
      return false;
    });
  });