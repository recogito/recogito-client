import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Dialog from '@radix-ui/react-dialog';
import type { DocumentInProject, Translations } from 'src/Types';
import { Documents } from './Documents';
import { Team } from './Team';
import { Instructions } from './Instructions';

import './AssignmentWizard.css';

interface AssignmentWizardProps {

  i18n: Translations;

  documents: DocumentInProject[];

  onCancel(): void;

}

const STEPS = [
  'documents',
  'team',
  'instructions'
]

export const AssignmentWizard = (props: AssignmentWizardProps) => {

  const [step, setStep] = useState(0);

  const onNext = () =>
    setStep(idx => Math.min(STEPS.length - 1, idx + 1));

  const onBack = () =>
    setStep(idx => Math.max(0, idx - 1));

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
          <Tabs.Root 
            className="tabs-root" 
            value={STEPS[step]}
            onValueChange={value => setStep(STEPS.indexOf(value))}>
            <Tabs.List className="tabs-list" aria-label="Create a new Assignment">
              <Tabs.Trigger className="tabs-trigger" value={STEPS[0]}>
                1. Documents
              </Tabs.Trigger>

              <Tabs.Trigger className="tabs-trigger" value={STEPS[1]}>
                2. Team
              </Tabs.Trigger>

              <Tabs.Trigger className="tabs-trigger" value={STEPS[2]}>
                3. Instructions
              </Tabs.Trigger>
            </Tabs.List>

            <Tabs.Content className="tabs-content" value={STEPS[0]}>
              <Documents
                i18n={props.i18n}
                documents={props.documents} 
                onCancel={props.onCancel}
                onNext={onNext} />
            </Tabs.Content>

            <Tabs.Content className="tabs-content" value={STEPS[1]}>
              <Team 
                i18n={props.i18n}
                onCancel={props.onCancel}
                onBack={onBack}
                onNext={onNext} />
            </Tabs.Content>

            <Tabs.Content className="tabs-content" value={STEPS[2]}>
              <Instructions 
                i18n={props.i18n} 
                onCancel={props.onCancel}
                onBack={onBack} />
            </Tabs.Content>
          </Tabs.Root>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}