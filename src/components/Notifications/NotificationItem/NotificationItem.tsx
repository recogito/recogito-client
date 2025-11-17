import { TimeAgo } from '@components/TimeAgo';
import { Button } from '@components/Button';
import type { Notification } from 'src/Types';
import { Info, WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import './NotificationItem.css';

interface NotificationItemProps {

  notification: Notification;

  onAcknowledged(): void;
}

export const NotificationItem = (props: NotificationItemProps) => {
  const { t, i18n } = useTranslation(['notifications']);

  const [busy, setBusy] = useState(false);

  const { notification } = props;

  return (
    <li className='notification-item'>
      <div className='notification-message-row'>
        {notification.message_type === 'ERROR' ? (
          <WarningCircle size={24} color='red' />
        ) : (
          <Info size={24} color='blue' />
        )}
        <p>{notification.message}</p>
      </div>
      <div>
        <TimeAgo datetime={notification.created_at} locale={i18n.language} />
        {notification.action_url && (
          <p>
            <a href={notification.action_url}>{notification.action_message}</a>
          </p>
        )}
      </div>
      <div className='notification-actions'>
        <Button
          busy={busy}
          className='primary tiny flat'
          onClick={() => {
            setBusy(true);
            props.onAcknowledged();
          }}
        >
          <span>{t('Acknowledge', { ns: 'notifications' })}</span>
        </Button>
      </div>
    </li>
  );
};
