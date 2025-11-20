import { getJob, updateJob } from '@backend/crud/jobs';
import { createClient } from '@supabase/supabase-js';
import { task, logger } from '@trigger.dev/sdk/v3';
import { exportProject } from '@trigger/exportProject';

interface Payload {
  key: string;
  jobId: string;
  projectId?: string;
  serverURL: string;
  token: string;
}

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

    let task;

    if (jobResp.data.job_type === 'EXPORT') {
      task = exportProject;
    }

    if (task) {
      // Update the job status
      await updateJob(supabase, { id: jobId, job_status: 'PROCESSING' });

      // Run the job
      const result = await task.triggerAndWait({
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
  }
});