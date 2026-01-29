import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { AnimatedCheck } from '@components/AnimatedIcons';
import { AnimatedFailure } from '@components/AnimatedIcons/AnimatedFailure';
import { useTranslation } from 'react-i18next';

import './RequestResultMessage.css';

interface RequestResultMessageProps {
  open: boolean;
  onClose(): void;
  state: 'success' | 'failure';
}

export const RequestResultMessage = (props: RequestResultMessageProps) => {
  const { open } = props;
  const { t } = useTranslation(['project-request']);
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='request-result-overlay' />
        <AlertDialog.Content className='request-result-content'>
          <AlertDialog.Title className='request-result-title'>
            {props.state === 'success'
              ? t('Request for Membership Sent!', { ns: 'project-request' })
              : t('Request for Membership Failed!', { ns: 'project-request' })}
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
              ? t('The admin of the project has been sent your request. Once approved you will be added to the project', { ns: 'project-request' })
              : t('Your request failed to send. Perhaps you have already requested membership?', { ns: 'project-request' })}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <AlertDialog.Cancel asChild>
              <button className='request-result-button' onClick={props.onClose}>
                {t('OK', { ns: 'project-request' })}
              </button>
            </AlertDialog.Cancel>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
