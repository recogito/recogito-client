import type { ExtendedProjectData, Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

export interface ProgressProps {
  i18n: Translations;

  project: ExtendedProjectData;

  assignment: AssignmentSpec;

  onSaved(assignment: AssignmentSpec): void;

  onError(error: string): void;
}

export type ProgressState =
  | 'idle'
  | 'creating_assignment'
  | 'updating_assignment'
  | 'success'
  | 'failed';
