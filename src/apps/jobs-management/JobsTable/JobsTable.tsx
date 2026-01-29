import { JobActions } from '@apps/jobs-management/JobsTable';
import { JobStatusPill } from '@apps/jobs-management/JobStatusPill';
import { Timestamp } from '@components/Timestamp';
import { useTranslation } from 'react-i18next';
import type { Job } from 'src/Types';

interface Props {
  jobs: Job[];
  onDelete(job: Job): void;
}

export const JobsTable = (props: Props) => {
  const { i18n, t } = useTranslation(['jobs-management', 'common']);

  return (
    <table className='jobs-table'>
      <thead>
        <tr>
          <th>{t('Timestamp', { ns: 'jobs-management' })}</th>
          <th>{t('Name', { ns: 'jobs-management' })}</th>
          <th>{t('Type', { ns: 'jobs-management' })}</th>
          <th>{t('Status', { ns: 'jobs-management' })}</th>
          <th>{t('User', { ns: 'jobs-management' })}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.jobs.map((job) => (
          <tr key={job.id}>
            <td><Timestamp datetime={job.created_at} locale={i18n.language} /></td>
            <td>{job.name}</td>
            <td>{t(job.job_type, { ns: 'jobs-management'})}</td>
            <td>
              <JobStatusPill
                i18n={i18n}
                status={job.job_status}
              />
            </td>
            <td>{job.created_by?.nickname}</td>
            <td className='actions'>
              <JobActions
                job={job}
                onDelete={() => props.onDelete(job)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};