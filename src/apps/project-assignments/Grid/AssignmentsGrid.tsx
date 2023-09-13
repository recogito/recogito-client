import { AssignmentCard } from '@components/AssignmentCard';
import type { Context, ExtendedProjectData, Translations } from 'src/Types';

import './AssignmentsGrid.css';

interface AssignmentsGridProps {

  i18n: Translations;

  project: ExtendedProjectData;

  // Just temporary, for hacking/testing
  assignments: Context[];

  onDeleteAssignment(assignment: Context): void;

}

export const AssignmentsGrid = (props: AssignmentsGridProps) => {

  return (
    <div className="project-assignments-grid">
      {props.assignments.map(assignment => (
        <AssignmentCard 
          key={assignment.id}
          i18n={props.i18n}
          project={props.project}
          assignment={assignment} 
          onDelete={() => props.onDeleteAssignment(assignment)} />
      ))}
    </div>
  )

}