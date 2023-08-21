import { AssignmentCard } from '@components/AssignmentCard';
import type { Context, Translations } from 'src/Types';

interface AssignmentsGridProps {

  i18n: Translations;

  // Just temporary, for hacking/testing
  assignments: Context[];

}

export const AssignmentsGrid = (props: AssignmentsGridProps) => {

  return (
    <div className="project-assignments-grid">
      {props.assignments.map(assignment => (
        <AssignmentCard 
          key={assignment.id}
          i18n={props.i18n}
          assignment={assignment} />
      ))}
    </div>
  )

}