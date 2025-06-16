import { TimeAgo } from '@components/TimeAgo';
import { Button } from '@components/Button';
import type { Notification, Translations } from 'src/Types';
import { Info, WarningCircle } from '@phosphor-icons/react';
import { useState } from 'react';

import './NotificationItem.css';

interface NotificationItemProps {
  i18n: Translations;

  notification: Notification;

  onAcknowledged(): void;

  onError(error: string): void;
}

export const NotificationItem = (props: NotificationItemProps) => {
  const { t } = props.i18n;

  const [busy, setBusy] = useState(false);

  const { notification } = props;

  return (
    <li className='notification-item'>
      <div className='notification-message-row'>
        {notification.message_type === 'ERROR' ? (
          <WarningCircle size={32} color='red' />
        ) : (
          <Info size={32} color='blue' />
        )}
        <p>{notification.message}</p>
      </div>
      <div>
        <TimeAgo datetime={notification.created_at} locale={props.i18n.lang} />
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
          <span>{t['Acknowledge']}</span>
        </Button>
      </div>
    </li>
  );
};
