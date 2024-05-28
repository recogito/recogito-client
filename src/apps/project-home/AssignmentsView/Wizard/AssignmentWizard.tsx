import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
import type {
  Document,
  DocumentWithLayers,
  ExtendedProjectData,
  Translations,
  UserProfile,
} from 'src/Types';
import type { AssignmentSpec } from './AssignmentSpec';
import { Documents } from './Documents';
import { Team } from './Team';
import { General } from './General';
import { Verify } from './Verify';
import { Layers } from './Layers';

import './AssignmentWizard.css';
import { ProgressCreating, ProgressUpdating } from './Progress';
import type { AvailableLayers } from '@backend/Types';

interface AssignmentWizardProps {
  i18n: Translations;

  assignment: AssignmentSpec;

  me: UserProfile;

  project: ExtendedProjectData;

  documents: Document[];

  availableLayers: AvailableLayers[];

  onClose(): void;

  onSaved(assignment: AssignmentSpec): void;
}

const STEPS = ['general', 'documents', 'layers', 'team', 'verify'];

export const AssignmentWizard = (props: AssignmentWizardProps) => {
  const { t } = props.i18n;

  const [step, setStep] = useState(0);

  const [saving, setSaving] = useState(false);

  const [complete, setComplete] = useState(false);

  const [assignment, setAssignment] = useState(props.assignment);

  // Flag indicating whether this is creating a new assignment
  // or updating an existing one
  const isUpdate = !(
    props.assignment.documents.length === 0 &&
    props.assignment.team.length === 0
  );

  const validityScore = [
    assignment.name,
    assignment.documents.length > 0,
    assignment.team.length > 0,
    assignment.description,
  ].filter(Boolean).length;

  const onNext = () => setStep((idx) => Math.min(STEPS.length - 1, idx + 1));

  const onBack = () => setStep((idx) => Math.max(0, idx - 1));

  const onChangeName = (name: string) =>
    setAssignment((assignment) => ({ ...assignment, name }));

  const onChangeDocuments = (documents: DocumentWithLayers[]) => {
    setAssignment((assignment) => ({ ...assignment, documents }));
  };

  const onChangeTeam = (team: UserProfile[]) =>
    setAssignment((assignment) => ({ ...assignment, team }));

  const onChangeLayers = (
    op: 'add' | 'remove',
    documentId: string,
    layerId: string
  ) => {
    const copyAssignment: AssignmentSpec = JSON.parse(
      JSON.stringify(assignment)
    );

    const layer = props.availableLayers.find(
      (l) => l.document_id === documentId && l.layer_id === layerId
    );

    const docIdx = copyAssignment.documents.findIndex(
      (d) => d.id === documentId
    );

    if (docIdx > -1) {
      const copy: DocumentWithLayers = JSON.parse(
        JSON.stringify(copyAssignment.documents[docIdx])
      );

      if (op === 'remove') {
        const idx = copy.layers.findIndex((l) => l.id === layerId);
        if (idx > -1) {
          copy.layers.splice(idx, 1);
          copyAssignment.documents.splice(docIdx, 1, copy);
          setAssignment(copyAssignment);
        }
      } else {
        copy.layers.push({
          id: layerId,
          document_id: documentId,
          project_id: assignment.project_id,
          name: '',
          is_active: layer!.is_active,
          context: {
            id: layer?.context_id,
            name: assignment.name,
            description: assignment.description,
            project_id: assignment.project_id,
          },
        });
        copyAssignment.documents.splice(docIdx, 1, copy);
        setAssignment(copyAssignment);
      }
    }
  };

  const onChangeDescription = (description: string) =>
    description
      ? setAssignment((assignment) => ({ ...assignment, description }))
      : setAssignment((assignment) => ({
          ...assignment,
          description: undefined,
        }));

  const onSaved = (assignment: AssignmentSpec) => {
    setComplete(true);
    props.onSaved(assignment);
  };

  // Don't close this dialog when the user clicks outside!
  const onPointerDownOutside = (evt: Event) => {
    if (!complete) evt.preventDefault();
  };

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className='dialog-overlay' />

        <Dialog.Content
          className='dialog-content assignment-wizard'
          onPointerDownOutside={onPointerDownOutside}
        >
          {saving ? (
            isUpdate ? (
              <ProgressUpdating
                i18n={props.i18n}
                project={props.project}
                assignment={assignment}
                previous={props.assignment}
                onSaved={onSaved}
                onError={() => setComplete(true)}
              />
            ) : (
              <ProgressCreating
                i18n={props.i18n}
                project={props.project}
                assignment={assignment}
                onSaved={onSaved}
                onError={() => setComplete(true)}
              />
            )
          ) : (
            <>
              <h2>{t['Create Assignment']}</h2>

              <Tabs.Root
                className='tabs-root'
                value={STEPS[step]}
                onValueChange={(value) => setStep(STEPS.indexOf(value))}
              >
                <Tabs.List
                  className='tabs-list'
                  aria-label={t['Create a new Assignment']}
                >
                  <Tabs.Trigger className='tabs-trigger' value={STEPS[0]}>
                    {t['1. General']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className='tabs-trigger' value={STEPS[1]}>
                    {t['2. Documents']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className='tabs-trigger' value={STEPS[2]}>
                    {t['3. Layers']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className='tabs-trigger' value={STEPS[3]}>
                    {t['4. Team']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className='tabs-trigger' value={STEPS[4]}>
                    {t['5. Verify']}
                    <span
                      className={
                        validityScore < 3
                          ? 'badge invalid'
                          : validityScore === 3
                          ? assignment.name
                            ? 'badge warn'
                            : 'badge invalid'
                          : 'badge valid'
                      }
                    >
                      {validityScore}/4
                    </span>
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content className='tabs-content' value={STEPS[0]}>
                  <General
                    i18n={props.i18n}
                    assignment={assignment}
                    onChangeDescription={onChangeDescription}
                    onChangeName={onChangeName}
                    onCancel={props.onClose}
                    onBack={onBack}
                    onNext={onNext}
                  />
                </Tabs.Content>

                <Tabs.Content className='tabs-content' value={STEPS[1]}>
                  <Documents
                    i18n={props.i18n}
                    assignment={assignment}
                    documents={props.documents}
                    onChange={onChangeDocuments}
                    onCancel={props.onClose}
                    onNext={onNext}
                  />
                </Tabs.Content>

                <Tabs.Content className='tabs-content' value={STEPS[2]}>
                  <Layers
                    i18n={props.i18n}
                    assignment={assignment}
                    onChange={onChangeLayers}
                    onCancel={props.onClose}
                    onBack={onBack}
                    onNext={onNext}
                    availableLayers={props.availableLayers}
                    documents={props.documents}
                  />
                </Tabs.Content>

                <Tabs.Content className='tabs-content' value={STEPS[3]}>
                  <Team
                    i18n={props.i18n}
                    me={props.me}
                    assignment={assignment}
                    project={props.project}
                    onChange={onChangeTeam}
                    onCancel={props.onClose}
                    onBack={onBack}
                    onNext={onNext}
                  />
                </Tabs.Content>

                <Tabs.Content className='tabs-content' value={STEPS[4]}>
                  <Verify
                    i18n={props.i18n}
                    assignment={assignment}
                    isUpdate={isUpdate}
                    onCancel={props.onClose}
                    onBack={onBack}
                    onSaveAssignment={() => setSaving(true)}
                  />
                </Tabs.Content>
              </Tabs.Root>
            </>
          )}

          {complete && (
            <Dialog.Close asChild>
              <button
                className='dialog-close icon-only unstyled'
                aria-label={t['Close']}
              >
                <X size={16} />
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};
