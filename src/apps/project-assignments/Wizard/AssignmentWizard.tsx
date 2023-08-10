import * as Dialog from '@radix-ui/react-dialog';
import type { Translations } from 'src/Types';

interface AssignmentWizardProps {

  i18n: Translations;

  onCancel(): void;

}

export const AssignmentWizard = (props: AssignmentWizardProps) => {

  // TODO implement 3 steps, as illustrated in the wireframes
  // 1. Pick documents
  // 2. Select team members
  // 3. Edit assignment Readme

  return (
    <Dialog.Root open={true} onOpenChange={() => props.onCancel()}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content className="invite-users dialog-content">
          <Dialog.Title className="dialog-title">
            New Assignment
          </Dialog.Title>

          <div className="wizard-tabs">

          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}