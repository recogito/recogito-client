import type { Translations } from 'src/Types';
import type { AssignmentSpec } from '../AssignmentSpec';

interface ProgressProps {

  i18n: Translations;

  assignment: AssignmentSpec;

}

export const Progress = (props: ProgressProps) => {

  return (
    <div>Progress Dialog</div>
  )

}