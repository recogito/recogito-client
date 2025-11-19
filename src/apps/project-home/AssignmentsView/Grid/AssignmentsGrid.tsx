import { AssignmentCard } from '@components/AssignmentCard';
import type { Context, ExtendedProjectData } from 'src/Types';

import './AssignmentsGrid.css';

interface AssignmentsGridProps {

  canUpdate?: boolean;

  project: ExtendedProjectData;

  assignments: Context[];

  onEditAssignment(assignment: Context): void;

  onDeleteAssignment(assignment: Context): void;

}

export const AssignmentsGrid = (props: AssignmentsGridProps) => {

  return (
    <div className="project-assignments-grid">
      {props.assignments.map(assignment => (
        <AssignmentCard 
          key={assignment.id}
          canUpdate={props.canUpdate}
          project={props.project}
          assignment={assignment} 
          onEdit={() => props.onEditAssignment(assignment)}
          onDelete={() => props.onDeleteAssignment(assignment)} />
      ))}
    </div>
  )

}