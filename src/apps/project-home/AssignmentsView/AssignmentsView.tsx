import { useEffect, useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import {
  archiveAssignment,
  getAllLayersInContext,
  getAssignment,
} from '@backend/helpers';
import { archiveLayer } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { useAssignments } from '@backend/hooks';
import { Button } from '@components/Button';
import { AssignmentSpec, AssignmentWizard, NEW_ASSIGNMENT, toAssignmentSpec } from './Wizard';
import type { Context, Document, ExtendedProjectData, MyProfile, Translations } from 'src/Types';
import { AssignmentsList } from './AssignmentsList';
import './AssignmentsView.css';
import type { ToastContent } from '@components/Toast';
import { AssignmentDetail } from './AssignmentDetail';

interface AssignmentsViewProps {
  i18n: Translations;

  me: MyProfile;

  isAdmin: boolean;

  project: ExtendedProjectData;

  documents: Document[];

  setToast(content: ToastContent): void;
}

export const AssignmentsView = (props: AssignmentsViewProps) => {
  const { t } = props.i18n;

  const { project } = props;

  const [editing, setEditing] = useState<AssignmentSpec | undefined>();

  const [currentAssignment, setCurrentAssignment] = useState<Context | undefined>();

  const { assignments, setAssignments } = useAssignments(project);

  useEffect(() => {
    if (assignments && assignments.length > 0) {
      setCurrentAssignment(assignments[0])
    }
  }, [assignments])

  const onAssignmentSaved = (assignment: Context) =>
    setAssignments((assignments) => {
      const isUpdate = assignments?.find((a) => a.id === assignment.id);

      return isUpdate
        ? assignments!.map((a) => (a.id === assignment.id ? assignment : a))
        : [...(assignments || []), assignment];
    });

  const onEditAssignment = (assignment: Context) =>
    getAssignment(supabase, assignment.id).then(({ data, error }) => {
      if (error || !data) {
        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not open the assignment.'],
          type: 'error',
        });
      } else {
        const spec = toAssignmentSpec(data);
        setEditing(spec);
      }
    });

  const onDeleteAssignment = (assignment: Context) => {
    // Optimistic update: remove assignment from the list
    setAssignments((assignments) =>
      (assignments || []).filter((a) => a.id !== assignment.id)
    );

    getAllLayersInContext(supabase, assignment.id).then(({ error, data }) => {
      if (error) {
        // Roll back
        setAssignments((assignments) => [...(assignments || []), assignment]);

        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the assignment.'],
          type: 'error',
        });
      } else {
        // Note this will get easier when (if) we get a single RPC call
        // to archive a list of records
        const chained = data.reduce(
          (p, nextLayer) => p.then(() => archiveLayer(supabase, nextLayer.id)),
          Promise.resolve()
        );

        chained
          .then(() => archiveAssignment(supabase, assignment.id))
          .then(() => {
            props.setToast({
              title: t['Deleted'],
              description: t['Assignment deleted successfully.'],
              type: 'success',
            });
          })
          .catch(() => {
            // Roll back
            setAssignments((assignments) => [
              ...(assignments || []),
              assignment,
            ]);

            props.setToast({
              title: t['Something went wrong'],
              description: t['Could not delete the assignment.'],
              type: 'error',
            });
          });
      }
    });
  };

  const handleAssignmentSelected = (assignment: Context) => {
    setCurrentAssignment(assignment)
  }

  return (
    <div className='project-assignments'>
      <header className='project-assignments-document-header-bar'>
        <h1>
          {t['Assignments']}
        </h1>
        {props.isAdmin && (
          <>
            <Button
              className='primary'
              onClick={() => setEditing(NEW_ASSIGNMENT)}
            >
              <GraduationCap size={20} /> <span>New Assignment</span>
            </Button>

            {editing && (
              <AssignmentWizard
                i18n={props.i18n}
                me={props.me}
                project={props.project}
                documents={props.documents}
                assignment={editing}
                onSaved={onAssignmentSaved}
                onClose={() => setEditing(undefined)}
              />
            )}
          </>
        )}
      </header>
      {assignments && assignments.length > 0 && currentAssignment &&
        <div className='project-assignments-presentation-pane'>
          <AssignmentsList
            assignments={assignments}
            i18n={props.i18n}
            currentAssignment={currentAssignment.id as string}
            onAssignmentSelect={handleAssignmentSelected}
          />
          <AssignmentDetail
            assignment={currentAssignment}
            onEditAssignment={() => onEditAssignment(currentAssignment)}
            i18n={props.i18n}
            isAdmin={props.isAdmin}
          />
        </div>
      }


      {/* {/*</div>
      {
    assignments ? (
      assignments.length === 0 ? (
        <div />
      ) : (
        <AssignmentsGrid
          i18n={props.i18n}
          canUpdate={canCreate}
          project={project}
          assignments={assignments}
          onEditAssignment={onEditAssignment}
          onDeleteAssignment={onDeleteAssignment}
        />
      )
    ) : (
      <div />
    )
  }
    </div > * /} */}
    </div>
  );
};
