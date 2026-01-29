import { getJob, updateJob } from '@backend/crud/jobs';
import { createClient } from '@supabase/supabase-js';
import { logger, task, tasks } from '@trigger.dev/sdk/v3';
import type { exportProject } from '@trigger/exportProject';
import type { importProject } from '@trigger/importProject';

interface Payload {
  jobId: string;
  projectId?: string;
  token: string;
  publicSupabaseUrl: string;
  publicSupabaseApiKey: string;
  iiifProjectId: string;
  iiifUrl: string;
  vaultTenantPath?: string;
}

const TASK_EXPORT = 'export-project';
const TASK_IMPORT = 'import-project';

export const runJob = task({
  id: 'run-job',
  run: async (payload: Payload) => {
    const { publicSupabaseUrl, publicSupabaseApiKey } = payload;

    if (!(publicSupabaseUrl && publicSupabaseApiKey)) {
      logger.error('Invalid Supabase credentials');
      return;
    }

    const { jobId, token, ...rest } = payload;

    const supabase = createClient(publicSupabaseUrl, publicSupabaseApiKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const jobResp = await getJob(supabase, jobId);

    if (jobResp.error) {
      logger.error(jobResp.error.message);
      return;
    }

    let task: 'import-project' | 'export-project' | null;

    if (jobResp.data.job_type === 'EXPORT') {
      task = TASK_EXPORT;
    } else if (jobResp.data.job_type === 'IMPORT') {
      task = TASK_IMPORT;
    } else {
      task = null;
    }

    if (!task) {
      logger.error(
        `Unable to find task for job_type: ${jobResp.data.job_type}`
      );
      return;
    }

    // Update the job status
    await updateJob(supabase, { id: jobId, job_status: 'PROCESSING' });

    // Run the job
    const result = await tasks.triggerAndWait<
      typeof exportProject | typeof importProject
    >(task, {
      token,
      jobId,
      ...rest,
    });

    // Update the job status based on the result
    if (result.ok) {
      await updateJob(supabase, { id: jobId, job_status: 'COMPLETE' });
    } else {
      await updateJob(supabase, { id: jobId, job_status: 'ERROR' });
    }
  },
});
