import {
  ArrowsClockwiseIcon,
  CheckIcon,
  GearIcon,
  WarningIcon
} from '@phosphor-icons/react';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import type { JobStatus } from 'src/Types';

import './JobStatusPill.css';

interface Props {
  status: JobStatus;
}

const JobStatuses = {
  initializing: 'INITIALIZING',
  processing: 'PROCESSING',
  complete: 'COMPLETE',
  error: 'ERROR'
};

export const JobStatusPill = ({ status }: Props) => {
  const { t } = useTranslation(['jobs-management']);

  return (
    <div
      className={clsx(
        'job-status-pill',
        { 'processing': status === JobStatuses.processing },
        { 'complete': status === JobStatuses.complete },
        { 'error': status === JobStatuses.error }
      )}
    >
      {status === JobStatuses.initializing && (
        <ArrowsClockwiseIcon />
      )}
      {status === JobStatuses.processing && (
        <GearIcon />
      )}
      {status === JobStatuses.complete && (
        <CheckIcon />
      )}
      {status === JobStatuses.error && (
        <WarningIcon />
      )}
      {t(status, { ns: 'jobs-management' })}
    </div>
  );
};