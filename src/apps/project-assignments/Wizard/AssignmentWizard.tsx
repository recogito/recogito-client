import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { Files, Info, ListChecks, UsersThree } from '@phosphor-icons/react';
import { EditableText } from '@components/EditableText';
import type { DocumentInProject, ExtendedProjectData, Translations, UserProfile } from 'src/Types';
import type { AssignmentSpec } from './AssignmentSpec';
import { Documents } from './Documents';
import { Team } from './Team';
import { Instructions } from './Instructions';
import { Verify } from './Verify';

import './AssignmentWizard.css';
import { Progress } from './Progress';

interface AssignmentWizardProps {

  i18n: Translations;

  project: ExtendedProjectData;

  documents: DocumentInProject[];

  onCancel(): void;

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
    name: 'Unnamed Assignement',
    documents: [],
    team: []
  });

  const onNext = () =>
    setStep(idx => Math.min(STEPS.length - 1, idx + 1));

  const onBack = () =>
    setStep(idx => Math.max(0, idx - 1));

  const onChangeName = (name: string) =>
    setAssignment({ ...assignment, name });

  const onChangeDocuments = (documents: DocumentInProject[]) =>
    setAssignment({ ...assignment, documents });

  const onChangeTeam = (team: UserProfile[]) =>
    setAssignment({...assignment, team });

  const onChangeDescription = (description: string) => description ? 
    setAssignment({ ...assignment, description }) :
    setAssignment({ ...assignment, description: undefined });

  // Don't close this dialog when the user clicks outside!
  const onPointerDownOutside = (evt: Event) =>
    evt.preventDefault();

  return (
    <Dialog.Root open={true} onOpenChange={() => props.onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content 
          className="dialog-content assignment-wizard"
          onPointerDownOutside={onPointerDownOutside}>

          {complete ? (
            <Progress 
              i18n={props.i18n} 
              assignment={assignment} />
          ) : (
            <>
              <h1>
                <EditableText 
                  focus={step === 0}
                  value="Untitled Assignment" 
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
                  </Tabs.Trigger>
                </Tabs.List>

                <Tabs.Content className="tabs-content" value={STEPS[0]}>
                  <Documents
                    i18n={props.i18n}
                    assignment={assignment}
                    documents={props.documents} 
                    onChange={onChangeDocuments}
                    onCancel={props.onCancel} 
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[1]}>
                  <Team 
                    i18n={props.i18n}
                    assignment={assignment}
                    project={props.project}
                    onChange={onChangeTeam}
                    onCancel={props.onCancel}
                    onBack={onBack}
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[2]}>
                  <Instructions 
                    i18n={props.i18n} 
                    assignment={assignment} 
                    onChange={onChangeDescription}
                    onCancel={props.onCancel}
                    onBack={onBack} 
                    onNext={onNext} />
                </Tabs.Content>

                <Tabs.Content className="tabs-content" value={STEPS[3]}>
                  <Verify 
                    i18n={props.i18n}
                    assignment={assignment}
                    onCancel={props.onCancel}
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