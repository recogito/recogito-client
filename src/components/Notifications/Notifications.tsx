import * as Popover from '@radix-ui/react-popover';
import { Bell, X } from '@phosphor-icons/react';
import type { Invitation, Project, Translations } from 'src/Types';
import { InvitationItem } from './InvitationItem';

import './Notifications.css';

const { Close, Content, Portal, Root, Trigger } = Popover;

interface NotificationsProps {
  
  i18n: Translations;

  invitations: Invitation[];

  onInvitationAccepted(invitation: Invitation, project: Project): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;

}

export const Notifications = (props: NotificationsProps) => {

  const count = props.invitations.length;

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
        <Content className="dropdown-content no-icons" alignOffset={-20} sideOffset={8} align="end">
          <section 
            className={count ? 'notifications-info' : 'notifications-info no-pending'}>
            <header>
              <h1>Notifications</h1>
              <Close className="popover-close" aria-label="Close">
                <X />
              </Close>
            </header>

            <ol>
              {props.invitations.map(invitation => (
                <InvitationItem 
                  key={invitation.id}
                  i18n={props.i18n}
                  invitation={invitation} 
                  onAccepted={project => props.onInvitationAccepted(invitation, project)} 
                  onDeclined={() => props.onInvitationDeclined(invitation)} 
                  onError={props.onError} />
              ))}
            </ol>
          </section>
        </Content>
      </Portal>
    </Root>
  )

}