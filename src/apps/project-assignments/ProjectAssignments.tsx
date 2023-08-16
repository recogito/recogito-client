import { useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { usePolicies } from '@backend/hooks/usePolicies';
import { useAssignments } from '@backend/hooks/useAssignments';
import { Button } from '@components/Button';
import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';

import './ProjectAssignments.css';
import { AssignmentWizard } from './Wizard';

interface ProjectAssignmentsProps {

  i18n: Translations;

  project: ExtendedProjectData;

  me: MyProfile;

}

export const ProjectAssignments = (props: ProjectAssignmentsProps) => {

  const { project } = props;

  const [wizardOpen, setWizardOpen] = useState(false);

  const policies = usePolicies(project.id);

  // This assumes that people with project UPDATE and context INSERT 
  // privileges are authorized to create assignments
  const canCreate = 
    policies?.get('projects').has('UPDATE') &&
    policies?.get('contexts').has('INSERT');

  const assignments = useAssignments(project);

  return (
    <div className="project-assignments">
      <h1>Assignments</h1>

      {canCreate && (
        <>
          <Button 
            className="primary"
            onClick={() => setWizardOpen(true)}>
            <GraduationCap size={20} /> <span>New Assignment</span>
          </Button>

          {wizardOpen && (
            <AssignmentWizard
              i18n={props.i18n} 
              onCancel={() => setWizardOpen(false)} />
          )}
        </>
      )}

      {assignments ? assignments.length === 0 ? (
        <span>Empty</span>
      ) : (
        <span>Got {assignments.length} assignments</span>
      ) : (
        <span>Loading</span>
      )}
    </div>
  )

}