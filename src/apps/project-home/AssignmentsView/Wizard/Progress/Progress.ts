import type { ExtendedProjectData } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

export interface ProgressProps {

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
