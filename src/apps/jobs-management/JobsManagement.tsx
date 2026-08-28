import { JobsTable } from '@apps/jobs-management/JobsTable';
import { deleteJob, getJobs } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Spinner } from '@components/Spinner';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { ArrowLeftIcon } from '@phosphor-icons/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';
import type { Job, MyProfile } from 'src/Types';

import './JobsManagement.css';
import type { RealtimeChannel } from '@supabase/supabase-js';

interface Props {
  me: MyProfile;
}

const JobsManagement = (props: Props) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastContent | null>(null);

  const { t, i18n } = useTranslation(['jobs-management', 'common']);

  const channel = useRef<RealtimeChannel>(null);

  const refresh = useCallback(() => {
    getJobs(supabase).then(({ error, data }) => {
      if (error) {
        setToast({
          title: t('Something went wrong', { ns: 'common' }),
          description: t('Could not load jobs.', { ns: 'jobs-management' }),
          type: 'error',
        });
      } else {
        setJobs(data);
      }

      setLoading(false);
    })
  }, [])

  useEffect(() => {
    if (!channel.current) {
      refresh()

      channel.current = supabase
        .channel('jobs-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'jobs',
          },
          ({ new: row }) => setJobs((prevJobs) => prevJobs.map((prevJob) => (
            prevJob.id === row.id ? {
              ...prevJob,
              name: row.name,
              job_status: row.job_status,
              job_type: row.job_type,
            } : prevJob
          )))
        )
        .on(
          'postgres_changes',
          {
            event: 'DELETE',
            schema: 'public',
            table: 'jobs',
          },
          ({ old }) => setJobs((prevJobs) => prevJobs.filter(
            (prevJob) => prevJob.id !== old.id)
          )
        )
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'jobs',
          },
          () => refresh()
        )
        .subscribe((status) => {
          //   other statuses trigger on page refresh or unmount so TIMED_OUT
          //   is the only one we can confidently display an error for
          if (status === 'TIMED_OUT') {
            setToast({
              title: t('Something went wrong', { ns: 'common' }),
              description: t('Could not fetch live updates from the server.', { ns: 'jobs-management' }),
              type: 'error',
            });
          }
        });
    }

    return () => {
      if (channel.current) {
        supabase.removeChannel(channel.current).then(() => {
          channel.current = null;
        });
      }
    };
  }, [refresh]);

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
        <main className='jobs-management-content' id='main'>
          <div className='jobs-management-table'>
            {loading ? (
              <div className='jobs-management-loading'>
                <Spinner />
              </div>
            ) : jobs.length > 0 ? (
              <JobsTable
                jobs={jobs}
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
        </main>
      </ToastProvider>
    </div>
  );
};

export const JobsManagementApp = (props: Props) => (
  <I18nextProvider i18n={clientI18next}>
    <JobsManagement {...props} />
  </I18nextProvider>
);