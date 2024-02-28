import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { DocumentInTaggedContext, Translations } from 'src/Types';
import { Button } from '@components/Button';

interface ManifestErrorDialogProps {

  i18n: Translations;

  document: DocumentInTaggedContext;

  message: string;

}

export const ManifestErrorDialog = (props: ManifestErrorDialogProps) => {

  // Note that the 'close' navigation always takes a while...
  // Therefore we want to give instant feedback
  const [clicked, setClicked] = useState(false);

  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const onClose = () => {
    setClicked(true);

    const back = contextName ? 
      `/${props.i18n.lang}/projects/${project_id}/assignments/${id}` : 
      `/${props.i18n.lang}/projects/${project_id}`;
  
    window.location.href = back;
  }

  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />

        <AlertDialog.Content className='manifest-error dialog-content'>
          <AlertDialog.Title className='dialog-title'>
            {props.i18n.t['Error']}
          </AlertDialog.Title>

          <AlertDialog.Description className='dialog-description'>
            {props.message}
          </AlertDialog.Description>

          <footer className='dialog-footer'>
            <AlertDialog.Action asChild>
              <Button 
                busy={clicked}
                className="primary"
                onClick={onClose}>
                <span>{props.i18n.t['Close']}</span>
              </Button>
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )

}