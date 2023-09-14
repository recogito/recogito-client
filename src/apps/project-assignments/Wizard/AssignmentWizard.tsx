import { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from '@phosphor-icons/react';
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

  me: UserProfile;

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

  const { t } = props.i18n;

  const [step, setStep] = useState(0);

  const [creating, setCreating] = useState(false);

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
  
  const onCreated = (assignment: Context) => {
    setComplete(true);
    props.onCreated(assignment);
  }

  // Don't close this dialog when the user clicks outside!
  const onPointerDownOutside = (evt: Event) => {
    if (!complete)
      evt.preventDefault();
  }

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content 
          className="dialog-content assignment-wizard"
          onPointerDownOutside={onPointerDownOutside}>

          {creating ? (
            <Progress 
              i18n={props.i18n} 
              project={props.project}
              assignment={assignment} 
              onCreated={onCreated}
              onError={() => setComplete(true)} />
          ) : (
            <>
              <h1>
                <EditableText 
                  focus={step === 0}
                  value={assignment.name || t['Unnamed Assignment']}
                  onSubmit={onChangeName} />
              </h1>

              <Tabs.Root 
                className="tabs-root" 
                value={STEPS[step]}
                onValueChange={value => setStep(STEPS.indexOf(value))}>
                <Tabs.List className="tabs-list" aria-label={t['Create a new Assignment']}>
                  <Tabs.Trigger className="tabs-trigger" value={STEPS[0]}>
                    {t['1. Documents']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[1]}>
                    {t['2. Team']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[2]}>
                    {t['3. Instructions']}
                  </Tabs.Trigger>

                  <Tabs.Trigger className="tabs-trigger" value={STEPS[3]}>
                    {t['4. Verify']}
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
                    me={props.me}
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
                    onCreateAssignment={() => setCreating(true)} />
                </Tabs.Content>
              </Tabs.Root>
            </>
          )}

          {complete && (
            <Dialog.Close asChild>
              <button className="dialog-close icon-only unstyled" aria-label="Close">
                <X size={16} />
              </button>
            </Dialog.Close>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}