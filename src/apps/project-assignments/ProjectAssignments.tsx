import { useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { archiveAssignment } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useProjectPolicies } from '@backend/hooks/usePolicies';
import { useAssignments } from '@backend/hooks/useAssignments';
import { Button } from '@components/Button';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { AssignmentWizard } from './Wizard';
import type { Context, DocumentInContext, ExtendedProjectData, MyProfile, Translations } from 'src/Types';
import { AssignmentsGrid } from './Grid';

import './ProjectAssignments.css';

interface ProjectAssignmentsProps {

  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  documents: DocumentInContext[];

}

export const ProjectAssignments = (props: ProjectAssignmentsProps) => {

  const { t } = props.i18n;

  const { project } = props;

  const [wizardOpen, setWizardOpen] = useState(false);

  const [error, setError] = useState<ToastContent | null>(null);

  const policies = useProjectPolicies(project.id);

  // This assumes that people with project UPDATE and context INSERT 
  // privileges are authorized to create assignments
  const canCreate =
    policies?.get('projects').has('UPDATE') &&
    policies?.get('contexts').has('INSERT');

  const { assignments, setAssignments } = useAssignments(project);

  const onAssignmentCreated = (assignment: Context) =>
    setAssignments(assignments => ([...(assignments || []), assignment]));

  const onDeleteAssignment = (assignment: Context) => {
    // Optimistic update: remove assignment from the list
    setAssignments(assignments => (assignments || []).filter(a => a.id !== assignment.id));

    archiveAssignment(supabase, assignment.id)
      .then(() => {
        // TODO toast?
      })
      .catch(() => {
        // Roll back optimistic update in case of failure
        setAssignments(assignments => ([...(assignments || []), assignment]));

        setError({
          title: t['Something went wrong'],
          description: t['Could not delete the assignment.'],
          type: 'error'
        });
      });
  }

  return (
    <ToastProvider>
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
                me={props.me}
                project={props.project}
                documents={props.documents}
                onCreated={onAssignmentCreated}
                onClose={() => setWizardOpen(false)} />
            )}
          </>
        )}

        {assignments ? assignments.length === 0 ? (
          <div />
        ) : (
          <AssignmentsGrid
            i18n={props.i18n}
            canUpdate={canCreate}
            project={project}
            assignments={assignments} 
            onDeleteAssignment={onDeleteAssignment} />
        ) : (
          <div />
        )}
      </div>

      <Toast
        content={error}
        onOpenChange={open => !open && setError(null)} />
    </ToastProvider>
  )

}