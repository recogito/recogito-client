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

  const { t } = props.i18n;

  return (
    <Root>
      <Trigger asChild>
        <button 
          className="unstyled icon-only notification-actions-trigger actions-trigger"
          disabled={false}>

          <Bell 
            size={18} />

          {Boolean(props.count) && ( 
            <div className="pip">{props.count}</div>
          )}
        </button>
      </Trigger>

      <Portal>
        <Content className="dropdown-content no-icons" sideOffset={5} align="center">
          <Item className="dropdown-item">
            <span>View all notifications</span>
          </Item>
        </Content>
      </Portal>
    </Root>
  )

}