import { JobsTable } from '@apps/jobs-management/JobsTable';
import { deleteJob } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useCallback, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';
import type { Job, MyProfile } from 'src/Types';

import './JobsManagement.css';

interface Props {
  jobs: Job[];
  me: MyProfile;
}

const JobsManagement = (props: Props) => {
  const [jobs, setJobs] = useState<Job[]>(props.jobs);
  const [toast, setToast] = useState<ToastContent | null>(null);

  const { t, i18n } = useTranslation(['jobs-management', 'common']);

  const onDelete = useCallback((job: Job) => (
    deleteJob(supabase, job.id).then(({ error }) => {
      if (error) {
        setToast({
          title: t('Something went wrong', { ns: 'common' }),
          description: t('Could not delete the job.', { ns: 'jobs-management' }),
          type: 'error',
        });
      } else {
        setToast({
          title: t('Deleted', { ns: 'common' }),
          description: t('Job deleted successfully.', { ns: 'jobs-management' }),
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
          onError={(error) => console.log(error)}
          me={props.me}
        />
        <div className='jobs-management-header'>
          <div>
            <a
              href={`/${i18n.language}/projects`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeftIcon className='text-bottom' size={16} />
              <span>{t('Back to Projects', { ns: 'jobs-management' })}</span>
            </a>
            <h1>{t('Jobs Management', { ns: 'jobs-management' })}</h1>
          </div>
        </div>
        <div className='jobs-management-content'>
          <div className='jobs-management-table'>
            {jobs.length > 0 ? (
              <JobsTable
                jobs={props.jobs}
                onDelete={onDelete}
              />
            ) : (
              <p>{t('No jobs', { ns: 'jobs-management' })}</p>
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

export const JobsManagementApp = (props: Props) => (
  <I18nextProvider i18n={clientI18next}>
    <JobsManagement {...props} />
  </I18nextProvider>
);