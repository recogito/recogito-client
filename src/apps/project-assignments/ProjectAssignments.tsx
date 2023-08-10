import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';

import './ProjectAssignments.css';

interface ProjectAssignmentsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  me: MyProfile;

}

export const ProjectAssignments = (props: ProjectAssignmentsProps) => {

  return (
    <div className="project-assignments">
      <h1>Assignments</h1>
    </div>
  )

}