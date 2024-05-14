import { useEffect, useState } from 'react';
import { GraduationCap } from '@phosphor-icons/react';
import { archiveAssignment, getAssignment } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import {
  AssignmentSpec,
  AssignmentWizard,
  contextToAssignmentSpec,
} from './Wizard';
import type {
  Context,
  Document,
  ExtendedProjectData,
  MyProfile,
  Translations,
} from 'src/Types';
import { AssignmentsList } from './AssignmentsList';
import './AssignmentsView.css';
import type { ToastContent } from '@components/Toast';
import { AssignmentDetail } from './AssignmentDetail';
import { assignmentSpecToContext } from './Wizard';
import type { AvailableLayers } from '@backend/Types';

interface AssignmentsViewProps {
  i18n: Translations;

  me: MyProfile;

  isAdmin: boolean;

  project: ExtendedProjectData;

  documents: Document[];

  assignments: Context[];

  availableLayers: AvailableLayers[];

  setToast(content: ToastContent): void;

  setAssignments(assignemnts: Context[]): void;
}

export const AssignmentsView = (props: AssignmentsViewProps) => {
  const { t } = props.i18n;

  const { project } = props;

  const [editing, setEditing] = useState<AssignmentSpec | undefined>();

  const [currentAssignment, setCurrentAssignment] = useState<
    Context | undefined
  >();

  const NEW_ASSIGNMENT = {
    project_id: project.id,
    documents: [],
    team: [],
  };

  useEffect(() => {
    if (props.assignments && props.assignments.length > 0) {
      setCurrentAssignment(props.assignments[0]);
    }
  }, [props.assignments]);

  const onAssignmentSaved = (spec: AssignmentSpec) => {
    const assignment = assignmentSpecToContext(spec);

    const isUpdate = props.assignments?.find(
      (a: Context) => a.id === assignment.id
    );
    // @ts-ignore
    props.setAssignments(
      // @ts-ignore
      isUpdate
        ? props.assignments!.map((a: Context) =>
            a.id === assignment.id ? assignment : a
          )
        : [...(props.assignments || []), assignment]
    );
  };

  const onEditAssignment = (assignment: Context) =>
    getAssignment(supabase, assignment.id as string).then(({ data, error }) => {
      if (error || !data) {
        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not open the assignment.'],
          type: 'error',
        });
      } else {
        const spec = contextToAssignmentSpec(data);
        setEditing(spec);
      }
    });

  const onDeleteAssignment = (assignment: Context) => {
    // Optimistic update: remove assignment from the list
    props.setAssignments(
      (props.assignments || []).filter((a) => a.id !== assignment.id)
    );

    archiveAssignment(supabase, assignment.id as string).then((data) => {
      if (!data) {
        // Roll back
        props.setAssignments([
          ...(props.assignments || []),
          assignment as Context,
        ]);

        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the assignment.'],
          type: 'error',
        });
      } else {
        props.setToast({
          title: t['Deleted'],
          description: t['Assignment deleted successfully.'],
          type: 'success',
        });
      }
    });
  };

  const handleAssignmentSelected = (assignment: Context) => {
    setCurrentAssignment(assignment);
  };

  return (
    <div className='project-assignments'>
      <header className='project-assignments-document-header-bar'>
        <h1>{t['Assignments']}</h1>
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
                availableLayers={props.availableLayers}
              />
            )}
          </>
        )}
      </header>
      {props.assignments &&
        props.assignments.length > 0 &&
        currentAssignment && (
          <div className='project-assignments-presentation-pane'>
            <AssignmentsList
              assignments={props.assignments}
              i18n={props.i18n}
              currentAssignment={currentAssignment.id as string}
              onAssignmentSelect={handleAssignmentSelected}
            />
            <AssignmentDetail
              assignment={currentAssignment}
              onEditAssignment={() => onEditAssignment(currentAssignment)}
              onDeleteAssignment={(assignment) =>
                onDeleteAssignment(assignment)
              }
              i18n={props.i18n}
              isAdmin={props.isAdmin}
            />
          </div>
        )}
    </div>
  );
};
