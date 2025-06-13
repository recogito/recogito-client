import { TimeAgo } from '@components/TimeAgo';
import { Button } from '@components/Button';
import type { Notification, Translations } from 'src/Types';
import { Info, WarningCircle } from '@phosphor-icons/react';

import './NotificationItem.css';

interface NotificationItemProps {
  i18n: Translations;

  notification: Notification;

  onAcknowledged(): void;

  onError(error: string): void;
}

export const NotificationItem = (props: NotificationItemProps) => {
  const { t } = props.i18n;

  const { notification } = props;

  return (
    <li className='notification-item Notification-item'>
      {notification.message_type === 'ERROR' ? <WarningCircle /> : <Info />}
      <p>{notification.message}</p>
      <TimeAgo datetime={notification.created_at} locale={props.i18n.lang} />
      <div className='notification-actions'>
        <Button className='primary tiny flat' onClick={props.onAcknowledged}>
          <span>{t['Acknowledge']}</span>
        </Button>
      </div>
    </li>
  );
};
