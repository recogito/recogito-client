import type { ExtendedAssignmentData, Translations } from 'src/Types';

import './AssignmentDetails.css';

interface AssignmentDetailsProps {

  i18n: Translations;

  assignment: ExtendedAssignmentData;

}

export const AssignmentDetails = (props: AssignmentDetailsProps) => {

  return (
    <div className="project-assignment-details">
      <h1>Assignment Details</h1>
    </div>
  )

}