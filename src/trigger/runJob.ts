import { getJob, updateJob } from '@backend/crud/jobs';
import { createClient } from '@supabase/supabase-js';
import { logger, task, tasks } from '@trigger.dev/sdk/v3';
import type { exportProject } from '@trigger/exportProject';
import type { importProject } from '@trigger/importProject';

interface Payload {
  key: string;
  jobId: string;
  projectId?: string;
  serverURL: string;
  token: string;
}

const TASK_EXPORT = 'export-project';
const TASK_IMPORT = 'import-project';

export const runJob = task({
  id: 'run-job',
  run: async (payload: Payload) => {
    const {
      key,
      jobId,
      serverURL,
      token,
      ...rest
    } = payload;

    const supabase = createClient(serverURL, key, {
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
      logger.error(`Unable to find task for job_type: ${jobResp.data.job_type}`);
      return;
    }

    // Update the job status
    await updateJob(supabase, { id: jobId, job_status: 'PROCESSING' });

    // Run the job
    const result = await tasks.triggerAndWait<typeof exportProject | typeof importProject>(task, {
      key,
      serverURL,
      token,
      jobId,
      ...rest
    });

    // Update the job status based on the result
    if (result.ok) {
      await updateJob(supabase, { id: jobId, job_status: 'COMPLETE'});
    } else {
      await updateJob(supabase, { id: jobId, job_status: 'ERROR'});
    }
  }
});