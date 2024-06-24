import * as AlertDialog from '@radix-ui/react-alert-dialog';
import type { Translations } from 'src/Types';
import { AnimatedCheck } from '@components/AnimatedIcons';

import './RequestResultMessage.css';
import { AnimatedFailure } from '@components/AnimatedIcons/AnimatedFailure';

interface RequestResultMessageProps {
  open: boolean;
  i18n: Translations;
  onClose(): void;
  state: 'success' | 'failure';
}

export const RequestResultMessage = (props: RequestResultMessageProps) => {
  const { open } = props;
  const { t } = props.i18n;
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='request-result-overlay' />
        <AlertDialog.Content className='request-result-content'>
          <AlertDialog.Title className='request-result-title'>
            {props.state === 'success'
              ? t['Request for Membership Sent!']
              : t['Request for Membership Failed!']}
          </AlertDialog.Title>
          <AlertDialog.Description className='request-result-description'>
            <div className='request-result-icon'>
              {props.state === 'success' ? (
                <AnimatedCheck size={36} />
              ) : (
                <AnimatedFailure size={36} />
              )}
            </div>
            {props.state === 'success'
              ? t[
                  'The admin of the project has been sent your request. Once approved you will be added to the project'
                ]
              : t[
                  'Your request failed to send. Please check that you are not already a member or retry the link'
                ]}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className='request-result-button' onClick={props.onClose}>
                {t['OK']}
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
