import { JobsTable } from '@apps/jobs-management/JobsTable';
import { deleteJob } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import type { Job, MyProfile, Translations } from 'src/Types';

import './JobsManagement.css';

interface Props {
  i18n: Translations;
  jobs: Job[];
  me: MyProfile;
}

export const JobsManagement = (props: Props) => {
  const [jobs, setJobs] = useState<Job[]>(props.jobs);
  const [toast, setToast] = useState<ToastContent | null>(null);

  const { lang, t } = props.i18n;

  const onDelete = useCallback((job: Job) => (
    deleteJob(supabase, job.id).then(({ error }) => {
      if (error) {
        setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the job.'],
          type: 'error',
        });
      } else {
        setToast({
          title: t['Deleted'],
          description: t['Job deleted successfully.'],
          type: 'success',
        });
        setJobs((prevJobs) => prevJobs.filter(
          (prevJob) => prevJob.id !== job.id)
        );
      }
    })
  ), []);

  return (
    <div className='jobs-management'>
      <ToastProvider>
        <TopBar
          i18n={props.i18n}
          onError={(error) => console.log(error)}
          me={props.me}
        />
        <div className='jobs-management-header'>
          <div>
            <a
              href={`/${lang}/projects`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeftIcon className='text-bottom' size={16} />
              <span>{t['Back to Projects']}</span>
            </a>
            <h1>{t['Jobs Management']}</h1>
          </div>
        </div>
        <div className='jobs-management-content'>
          <div className='jobs-management-table'>
            {jobs.length > 0 ? (
              <JobsTable
                i18n={props.i18n}
                jobs={props.jobs}
                onDelete={onDelete}
              />
            ) : (
              <p>{t['No jobs']}</p>
            )}
          </div>
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
        </div>
      </ToastProvider>
    </div>
  );
};