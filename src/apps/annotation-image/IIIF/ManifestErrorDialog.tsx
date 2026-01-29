import { useState } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { DocumentWithContext } from 'src/Types';
import { Button } from '@components/Button';
import { useTranslation } from 'react-i18next';

interface ManifestErrorDialogProps {
  document: DocumentWithContext;

  message: string;
}

export const ManifestErrorDialog = (props: ManifestErrorDialogProps) => {
  const { t, i18n } = useTranslation(['annotation-common']);

  // Note that the 'close' navigation always takes a while...
  // Therefore we want to give instant feedback
  const [clicked, setClicked] = useState(false);

  const contextName = props.document.context.name;

  const { id, project_id } = props.document.context;

  const onClose = () => {
    setClicked(true);

    const back = contextName
      ? `/${i18n.language}/projects/${project_id}/assignments/${id}`
      : `/${i18n.language}/projects/${project_id}`;

    window.location.href = back;
  };

  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />

        <AlertDialog.Content className='manifest-error dialog-content'>
          <AlertDialog.Title className='dialog-title'>
            {t('Error', { ns: 'annotation-common' })}
          </AlertDialog.Title>

          <AlertDialog.Description className='dialog-description'>
            {props.message}
          </AlertDialog.Description>

          <footer className='dialog-footer'>
            <AlertDialog.Action asChild>
              <Button busy={clicked} className='primary' onClick={onClose}>
                <span>{t('Close', { ns: 'annotation-common' })}</span>
              </Button>
            </AlertDialog.Action>
          </footer>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
