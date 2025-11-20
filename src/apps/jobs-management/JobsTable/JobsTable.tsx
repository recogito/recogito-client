import { JobActions } from '@apps/jobs-management/JobsTable';
import { JobStatusPill } from '@apps/jobs-management/JobStatusPill';
import { Timestamp } from '@components/Timestamp';
import type { Job, Translations } from 'src/Types';

interface Props {
  i18n: Translations;
  jobs: Job[];
  onDelete(job: Job): void;
}

export const JobsTable = (props: Props) => {
  const { lang, t } = props.i18n;

  return (
    <table className='jobs-table'>
      <thead>
        <tr>
          <th>{t['Timestamp']}</th>
          <th>{t['Name']}</th>
          <th>{t['Type']}</th>
          <th>{t['Status']}</th>
          <th>{t['User']}</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {props.jobs.map((job) => (
          <tr key={job.id}>
            <td><Timestamp datetime={job.created_at} locale={lang} /></td>
            <td>{job.name}</td>
            <td>{t[job.job_type]}</td>
            <td>
              <JobStatusPill
                i18n={props.i18n}
                status={job.job_status}
              />
            </td>
            <td>{job.created_by?.nickname}</td>
            <td className='actions'>
              <JobActions
                i18n={props.i18n}
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