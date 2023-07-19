import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { Bell } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

import './Notifications.css';

const { Content, Item, Portal, Root, Trigger } = Dropdown;

interface NotificationsProps {
  
  i18n: Translations;

  count: number;

}

export const Notifications = (props: NotificationsProps) => {

  const { count } = props;

  const { lang, t } = props.i18n;

  return (
    <Root>
      <Trigger asChild >
        <button 
          className="unstyled icon-only notification-actions-trigger actions-trigger"
          disabled={false}>

          <Bell 
            size={18} />

          {Boolean(count) && ( 
            <div className="pip">{count}</div>
          )}
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content no-icons" alignOffset={-20} sideOffset={5} align="end">
          <section 
            className={count ? 'notifications-info' : 'notifications-info no-pending'}>
            {Boolean(count) ? (
              <>
                <div>You have {count} unread notifications</div>
                <a href={`/${lang}/notifications`} className="button primary flat sm">View</a>
              </>
            ) : (
              <>
                <div>{t['No unread notifications']}</div>
                <a href={`/${lang}/notifications`} className="button flat sm">View all notifications</a>
              </>
            )}
          </section>
        </Content>
      </Portal>
    </Root>
  )

}