import type { Context, Translations } from 'src/Types';
import { GraduationCap } from '@phosphor-icons/react';
import { AssignmentCardActions } from './AssignmentCardActions';

import './AssignmentCard.css';

interface AssignmentCardProps {

  i18n: Translations;

  // Just temporary, for hacking/testing
  assignment: Context;

}

export const AssignmentCard = (props: AssignmentCardProps) => {

  const { assignment } = props;

  return (
    <article className="assignment-card">
      <div className="ribbon">
        <GraduationCap size={18} />
      </div>
      <div className="top">
        <h1>
          My First Project
        </h1>
        <h2>
          {assignment.name}
        </h2>
      </div>

      <div className="bottom">
        <AssignmentCardActions i18n={props.i18n} />
      </div>
    </article>
  )

}