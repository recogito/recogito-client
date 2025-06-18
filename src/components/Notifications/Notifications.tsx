import { useEffect, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, X } from '@phosphor-icons/react';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
  Notification,
} from 'src/Types';
import { EmptyList } from './EmptyList';
import { InvitationItem } from './InvitationItem';
import { NotificationItem } from './NotificationItem';
import { InvitationConfirmation } from './InvitiationConfirmation';
import { supabase } from '@backend/supabaseBrowserClient';
import { listMyInvites, listMyNotifications } from '@backend/crud';
import { acknowledgeNotification } from '@backend/helpers';

import './Notifications.css';

const { Close, Content, Portal, Root, Trigger } = Popover;

interface NotificationsProps {
  i18n: Translations;

  isCreator?: boolean;

  onInvitationAccepted(project: ExtendedProjectData): void;

  onError(error: string): void;

  me: MyProfile;
}

export const Notifications = (props: NotificationsProps) => {
  const { t } = props.i18n;

  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [repeat, setRepeat] = useState(1);

  const remaining = invitations.filter((i) => !i.ignored);

  const count = remaining.length + notifications.length;
  useEffect(() => {
    const updateNotifications = async () => {
      const inviteResp = await listMyInvites(supabase, props.me);
      if (!inviteResp.error) {
        setInvitations(inviteResp.data);
      }

      const notificationResp = await listMyNotifications(supabase, props.me);
      if (!notificationResp.error) {
        setNotifications(notificationResp.data);
      }
    };
    supabase
      .channel('notification-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
        },
        () => updateNotifications()
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invites',
        },
        () => updateNotifications()
      )
      .subscribe();

    updateNotifications();
  }, []);

  const [showConfirmation, setShowConfirmation] = useState<
    Invitation | undefined
  >(undefined);

  const onAccepted =
    (invitation: Invitation) => (project: ExtendedProjectData) => {
      setShowConfirmation(invitation);
      props.onInvitationAccepted(project);
    };

  const handleAcknowledge = async (notification: Notification) => {
    await acknowledgeNotification(supabase, notification.id);
  };

  return (
    <>
      <Root>
        <Trigger asChild>
          <button
            className='unstyled icon-only notification-actions-trigger actions-trigger'
            aria-label={t['Show notifications']}
            disabled={false}
          >
            <Bell size={18} />

            {Boolean(count) && <div className='pip'>{count}</div>}
          </button>
        </Trigger>

        <Portal>
          <Content
            className='popover-content no-icons'
            alignOffset={-20}
            sideOffset={8}
            align='end'
          >
            <section
              className={count ? 'notifications' : 'notifications no-pending'}
            >
              <header>
                <h1>{t['Notifications']}</h1>
                <Close
                  className='unstyled icon-only popover-close'
                  aria-label={t['Close']}
                >
                  <X size={16} />
                </Close>
              </header>

              {count === 0 ? (
                <EmptyList i18n={props.i18n} />
              ) : (
                <ol>
                  {remaining.map((invitation) => (
                    <InvitationItem
                      key={invitation.id}
                      i18n={props.i18n}
                      invitation={invitation}
                      onAccepted={onAccepted(invitation)}
                      onError={props.onError}
                    />
                  ))}
                  {notifications.map((notification) => (
                    <NotificationItem
                      key={notification.id}
                      i18n={props.i18n}
                      notification={notification}
                      onError={props.onError}
                      onAcknowledged={() => handleAcknowledge(notification)}
                    />
                  ))}
                </ol>
              )}
            </section>
          </Content>
        </Portal>
      </Root>

      {showConfirmation && (
        <InvitationConfirmation
          i18n={props.i18n}
          invitation={showConfirmation}
          isCreator={props.isCreator}
          onClose={() => setShowConfirmation(undefined)}
        />
      )}
    </>
  );
};
