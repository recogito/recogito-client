import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';

import './FatalError.css';

interface FatalErrorProps {

  error: Error;

  i18n: Translations;

}

export const FatalError = (props: FatalErrorProps) => {

  const { t } = props.i18n;

  return (
    <AlertDialog.Root open={true}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="dialog-overlay" />

        <AlertDialog.Content className="dialog-content fatal-error">
          <AlertDialog.Title className="dialog-title">
            {t['Error']}
          </AlertDialog.Title>

          <AlertDialog.Description className='dialog-description'>
            {t['Something went wrong loading this document.']}

            <code>
              {props.error.toString()}
            </code>
          </AlertDialog.Description>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  )

}