import { useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { archiveAssignment, getAllLayersInContext, getAssignment } from '@backend/helpers';
import { archiveLayer } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { useAssignments, useProjectPolicies } from '@backend/hooks';
import { Button } from '@components/Button';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { AssignmentWizard } from './Wizard';
import type { Context, DocumentInContext, ExtendedProjectData, MyProfile, Translations } from 'src/Types';
import { AssignmentsGrid } from './Grid';

import './ProjectAssignments.css';
import { AssignmentSpec } from './Wizard/AssignmentSpec';

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

  const [toast, setToast] = useState<ToastContent | null>(null);

  const policies = useProjectPolicies(project.id);

  // This assumes that people with project UPDATE and context INSERT 
  // privileges are authorized to create assignments
  const canCreate =
    policies?.get('projects').has('UPDATE') &&
    policies?.get('contexts').has('INSERT');

  const { assignments, setAssignments } = useAssignments(project);

  const onAssignmentCreated = (assignment: Context) =>
    setAssignments(assignments => ([...(assignments || []), assignment]));

  const onEditAssignment = (assignment: Context) =>
    getAssignment(supabase, assignment.id).then(({ data, error }) => {
      if (error) {
        setToast({
          title: t['Something went wrong'],
          description: t['Could not open the assignment.'],
          type: 'error'
        });
      } else {
        // TODO compile an AssignmentSpec object for the wizard
        console.log('editing', data);
      }
    });

  const onDeleteAssignment = (assignment: Context) => {
    // Optimistic update: remove assignment from the list
    setAssignments(assignments => (assignments || []).filter(a => a.id !== assignment.id));

    getAllLayersInContext(supabase, assignment.id).then(({ error, data }) => {
      if (error) {
        // Roll back
        setAssignments(assignments => ([...(assignments || []), assignment]));

        setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the assignment.'],
          type: 'error'
        });
      } else {
        // Note this will get easier when (if) we get a single RPC call
        // to archive a list of records
        const chained = data.reduce((p, nextLayer) => 
          p.then(() => archiveLayer(supabase, nextLayer.id)
        ), Promise.resolve());

        chained
          .then(() => archiveAssignment(supabase, assignment.id))
          .then(() => {
            setToast({
              title: t['Deleted'],
              description: t['Assignment deleted successfully.'],
              type: 'success'
            });
          })
          .catch(() => {
            // Roll back
            setAssignments(assignments => ([...(assignments || []), assignment]));

            setToast({
              title: t['Something went wrong'],
              description: t['Could not delete the assignment.'],
              type: 'error'
            });
          });
      }
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
            onEditAssignment={onEditAssignment}
            onDeleteAssignment={onDeleteAssignment} />
        ) : (
          <div />
        )}
      </div>

      <Toast
        content={toast}
        onOpenChange={open => !open && setToast(null)} />
    </ToastProvider>
  )

}