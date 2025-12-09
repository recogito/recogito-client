import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from 'react-i18next';

import './FatalError.css';

interface FatalErrorProps {
  error: Error;
}

export const FatalError = (props: FatalErrorProps) => {
  const { t } = useTranslation(['annotation-common']);
  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='dialog-overlay' />

        <AlertDialog.Content className='dialog-content fatal-error'>
          <AlertDialog.Title className='dialog-title'>
            {t('Error', { ns: 'annotation-common' })}
          </AlertDialog.Title>

          <AlertDialog.Description className='dialog-description'>
            {t('Something went wrong loading this document.', { ns: 'annotation-common' })}

            <code>{props.error.toString()}</code>
          </AlertDialog.Description>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
