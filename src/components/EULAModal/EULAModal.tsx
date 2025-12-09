import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useTranslation } from 'react-i18next';

interface EULAModalProps {
  open: boolean;
  onCancel(): void;
  onConfirm(): void;
}

export const EULAModal = (props: EULAModalProps) => {
  const { open } = props;
  const { t } = useTranslation(['project-home', 'common']);
  return (
    <AlertDialog.Root open={open}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className='alert-dialog-overlay' />
        <AlertDialog.Content className='alert-dialog-content'>
          <AlertDialog.Title className='alert-dialog-title'>
            {t('Accept End User License Agreement', { ns: 'project-home' })}
          </AlertDialog.Title>
          <AlertDialog.Description className='alert-dialog-description'>
            {t('uploaded_content_warning', { ns: 'project-home' })}
          </AlertDialog.Description>
          <div style={{ display: 'flex', gap: 25, justifyContent: 'flex-end' }}>
            <a href={import.meta.env.PUBLIC_EULA_URL} target='_blank' rel='noreferrer'>
              <button className='alert-dialog-button'>{t('Read EULA', { ns: 'project-home' })}</button>
            </a>
            <AlertDialog.Cancel asChild>
              <button className='alert-dialog-button' onClick={props.onCancel}>
                {t('Cancel', { ns: 'common' })}
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                className='alert-dialog-button-primary'
                onClick={props.onConfirm}
              >
                {t('I have read and accept EULA', { ns: 'project-home' })}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
};
