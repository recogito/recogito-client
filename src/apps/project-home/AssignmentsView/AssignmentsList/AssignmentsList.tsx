import type { Context, Translations } from 'src/Types';

interface AssignmentsListProps {
  assignments: Context[];

  currentAssignment: string;

  i18n: Translations;

  onAssignmentSelect(assignment: Context): void;
}

import './AssignmentsList.css'

export const AssignmentsList = (props: AssignmentsListProps) => {

  const { t } = props.i18n;

  return (
    <div className='assignment-list-list' >
      {props.assignments.map(assignment => (
        <div className={assignment.id === props.currentAssignment ? 'assignments-list-item active' : 'assignments-list-item'}
          key={assignment.id}
          onClick={() => props.onAssignmentSelect(assignment)}
        >
          <div className='assignments-list-item-date'>
            {new Date(assignment.created_at).toLocaleDateString()}
          </div>
          <div className='assignments-list-item-title'>
            {assignment.is_project_default ? t['Project Base Assignment'] : assignment.name}
          </div>
        </div>
      ))}
    </div>
  );

}