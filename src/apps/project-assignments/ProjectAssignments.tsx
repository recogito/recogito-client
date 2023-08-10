import { usePolicies } from '@backend/hooks/usePolicies';
import { useAssignments } from '@backend/hooks/useAssignments';
import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';

import './ProjectAssignments.css';

interface ProjectAssignmentsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  me: MyProfile;

}

export const ProjectAssignments = (props: ProjectAssignmentsProps) => {

  const { project } = props;

  const policies = usePolicies(project.id);

  const assignmnets = useAssignments(project);

  return (
    <div className="project-assignments">
      <h1>Assignments</h1>
    </div>
  )

}