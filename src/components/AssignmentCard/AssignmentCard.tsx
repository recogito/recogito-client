import type { Context, ExtendedProjectData, Translations } from 'src/Types';
import { GraduationCap } from '@phosphor-icons/react';
import { AssignmentCardActions } from './AssignmentCardActions';

import './AssignmentCard.css';

interface AssignmentCardProps {

  i18n: Translations;

  project: ExtendedProjectData;

  // Just temporary, for hacking/testing
  assignment: Context;

  onDelete(): void;

}

export const AssignmentCard = (props: AssignmentCardProps) => {

  const { assignment, project } = props;

  const onClick = () =>
    window.location.href = `/${props.i18n.lang}/projects/${assignment.project_id}/assignments/${assignment.id}`;

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

      <div className="bottom">
        <AssignmentCardActions 
          i18n={props.i18n} 
          onDelete={props.onDelete} />
      </div>
    </article>
  )

}