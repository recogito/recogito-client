import {
  ArrowsClockwiseIcon,
  CheckIcon,
  GearIcon,
  WarningIcon
} from '@phosphor-icons/react';
import clsx from 'clsx';
import type { JobStatus, Translations } from 'src/Types';

import './JobStatusPill.css';

interface Props {
  i18n: Translations;
  status: JobStatus;
}

const JobStatuses = {
  initializing: 'INITIALIZING',
  processing: 'PROCESSING',
  complete: 'COMPLETE',
  error: 'ERROR'
};

export const JobStatusPill = ({ i18n, status }: Props) => {
  const { t } = i18n;

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
      {t[status]}
    </div>
  );
};