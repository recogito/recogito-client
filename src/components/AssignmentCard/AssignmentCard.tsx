import type { Context, ExtendedProjectData } from 'src/Types';
import { GraduationCap } from '@phosphor-icons/react';
import { AssignmentCardActions } from './AssignmentCardActions';
import { useTranslation } from 'react-i18next';

import './AssignmentCard.css';

interface AssignmentCardProps {

  project: ExtendedProjectData;

  canUpdate?: boolean;

  assignment: Context;

  onEdit(): void;

  onDelete(): void;

}

export const AssignmentCard = (props: AssignmentCardProps) => {
  const { i18n } = useTranslation();

  const { assignment, project } = props;

  const onClick = () =>
    window.location.href = `/${i18n.language}/projects/${assignment.project_id}/assignments/${assignment.id}`;

  return (
    <article className="assignment-card" onClick={onClick}>
      <div className="ribbon">
        <GraduationCap size={18} />
      </div>
      <div className="top">
        <h1>
          {project.name}
        </h1>
        <h2>
          {assignment.name}
        </h2>
      </div>

      {props.canUpdate && (
        <div className="bottom">
          <AssignmentCardActions  
            assignment={assignment}
            onEdit={props.onEdit}
            onDelete={props.onDelete} />
        </div>
      )}
    </article>
  )

}