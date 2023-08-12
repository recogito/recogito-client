import { useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, X } from '@phosphor-icons/react';
import type { ExtendedProjectData, Invitation, Translations } from 'src/Types';
import { EmptyList } from './EmptyList';
import { InvitationItem } from './InvitationItem';

import './Notifications.css';
import { InvitationConfirmation } from './InvitiationConfirmation';

const { Close, Content, Portal, Root, Trigger } = Popover;

interface NotificationsProps {
  
  i18n: Translations;

  invitations: Invitation[];

  onInvitationAccepted(invitation: Invitation, project: ExtendedProjectData): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;

}

export const Notifications = (props: NotificationsProps) => {

  const { t } = props.i18n;

  const unhandled = props.invitations.filter(i => !i.ignored);

  const count = unhandled.length;

  const [showConfirmation, setShowConfirmation] = useState<Invitation | undefined>({} as unknown as Invitation);

  const onAccepted = (invitation: Invitation) => (project: ExtendedProjectData) => {    
    setShowConfirmation(invitation);
    props.onInvitationAccepted(invitation, project)
  }

  return (
    <>
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
          <Content className="popover-content no-icons" alignOffset={-20} sideOffset={8} align="end">
            <section 
              className={count ? 'notifications' : 'notifications no-pending'}>
              <header>
                <h1>{t['Notifications']}</h1>
                <Close className="unstyled icon-only popover-close" aria-label="Close">
                  <X size={16} />
                </Close>
              </header>

              {count === 0 ? (
                <EmptyList i18n={props.i18n} />
              ) : (
                <ol>
                  {props.invitations.map(invitation => (
                    <InvitationItem 
                      key={invitation.id}
                      i18n={props.i18n}
                      invitation={invitation} 
                      onAccepted={onAccepted(invitation)} 
                      onDeclined={() => props.onInvitationDeclined(invitation)} 
                      onError={props.onError} />
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
          onClose={() => setShowConfirmation(undefined)} />
      )}
    </>
  )

}