import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { Files, Info, ListChecks, UsersThree } from '@phosphor-icons/react';
import { EditableText } from '@components/EditableText';
import type { Context, DocumentInContext, ExtendedProjectData, Translations, UserProfile } from 'src/Types';
import type { AssignmentSpec } from './AssignmentSpec';
import { Documents } from './Documents';
import { Team } from './Team';
import { Instructions } from './Instructions';
import { Verify } from './Verify';
import { Progress } from './Progress';

import './AssignmentWizard.css';

interface AssignmentWizardProps {

  i18n: Translations;

  project: ExtendedProjectData;

  documents: DocumentInContext[];

  onClose(): void;

  onCreated(assignment: Context): void;

}

const STEPS = [
  'documents',
  'team',
  'instructions',
  'verify'
];

export const AssignmentWizard = (props: AssignmentWizardProps) => {

  const [step, setStep] = useState(0);

  const [complete, setComplete] = useState(false);

  const [assignment, setAssignment] = useState<AssignmentSpec>({
    documents: [],
    team: []
  });

  const validityScore = [
    assignment.name,
    assignment.documents.length > 0,
    assignment.team.length > 0,
    assignment.description
  ].filter(Boolean).length;

  const onNext = () =>
    setStep(idx => Math.min(STEPS.length - 1, idx + 1));

  const onBack = () =>
    setStep(idx => Math.max(0, idx - 1));

  const onChangeName = (name: string) =>
    setAssignment(assignment => ({ ...assignment, name }));

  const onChangeDocuments = (documents: DocumentInContext[]) =>
    setAssignment(assignment => ({ ...assignment, documents }));

  const onChangeTeam = (team: UserProfile[]) =>
    setAssignment(assignment => ({...assignment, team }));

  const onChangeDescription = (description: string) => description ? 
    setAssignment(assignment => ({ ...assignment, description })) :
    setAssignment(assignment => ({ ...assignment, description: undefined }));

  // Don't close this dialog when the user clicks outside!
  const onPointerDownOutside = (evt: Event) =>
    evt.preventDefault();

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content 
          className="dialog-content assignment-wizard"
          onPointerDownOutside={onPointerDownOutside}>

          {complete ? (
            <Progress 
              i18n={props.i18n} 
              project={props.project}
              assignment={assignment} 
              onCreated={props.onCreated}
              onClose={props.onClose}/>
          ) : (
            <>
              <h1>
                <EditableText 
                  focus={step === 0}
                  value={assignment.name || 'Unnamed Assignment'}
                  onSubmit={onChangeName} />
              </h1>

              <Tabs.Root 
                className="tabs-root" 
                value={STEPS[step]}
                onValueChange={value => setStep(STEPS.indexOf(value))}>
                <Tabs.List className="tabs-list" aria-label="Create a new Assignment">
                  <Tabs.Trigger className="tabs-trigger" value={STEPS[0]}>
                    <Files size={18} /> Documents
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[1]}>
                    <UsersThree size={18} /> Team
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[2]}>
                    <Info size={18} /> Instructions
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[3]}>
                    <ListChecks size={18} /> Verify
                    <span 
                      className={
                        validityScore < 3 ? 'badge invalid' : 
                        validityScore === 3 ? (assignment.name ? 'badge warn' : 'badge invalid') :
                          'badge valid'
                      }>
                      {validityScore}/4
                    </span>
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content className="tabs-content" value={STEPS[0]}>
                  <Documents
                    i18n={props.i18n}
                    assignment={assignment}
                    documents={props.documents} 
                    onChange={onChangeDocuments}
                    onCancel={props.onClose} 
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[1]}>
                  <Team 
                    i18n={props.i18n}
                    assignment={assignment}
                    project={props.project}
                    onChange={onChangeTeam}
                    onCancel={props.onClose}
                    onBack={onBack}
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[2]}>
                  <Instructions 
                    i18n={props.i18n} 
                    assignment={assignment} 
                    onChange={onChangeDescription}
                    onCancel={props.onClose}
                    onBack={onBack} 
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[3]}>
                  <Verify 
                    i18n={props.i18n}
                    assignment={assignment}
                    onCancel={props.onClose}
                    onBack={onBack} 
                    onCreateAssignment={() => setComplete(true)} />
                </Tabs.Content>
              </Tabs.Root>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}