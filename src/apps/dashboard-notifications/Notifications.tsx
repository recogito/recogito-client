import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { NotificationCard } from '@components/NotificationCard';
import { DashboardHeader } from '@components/DashboardHeader';
import { processAcceptInvite, processIgnoreInvite, processUnignoreInvite } from '@backend/crud/notifications';
import type { Invitation, Translations } from 'src/Types';

import './Notification.css';

export interface NotificationsProps {

  i18n: Translations

}

export const Notifications = (props: NotificationsProps) => {

  const { t } = props.i18n;

  const [invites, setInvites] = useState<any[]>([]);
  const [showIgnored, setShowIgnored] = useState(false);
  const [displayList, setDisplayList] = useState<any[]>([]);
  const [ignoredCount, setIgnoredCount] = useState(0);

  const removeInviteFromList = (id: string) => {
    setInvites((old) => old.filter((i) => i.id != id));
  };

  const toggleInviteIgnored = (id: string) => {
    setInvites((old) => old.map((i) => {
      return i.id == id ? { ...i, ignored: !i.ignored } : i;
    }));
  }

  useEffect(() => {
    /*
    const cardData = (props.invitationList && props.invitationList.length > 0) ? props.invitationList.map((i) => ({
      ...i,
      onAccept: () => processAcceptInvite(supabase, i.id).then(() => removeInviteFromList(i.id)),
      onIgnore: () => processIgnoreInvite(supabase, i.id).then(() => toggleInviteIgnored(i.id)),
      onUnignore: () => processUnignoreInvite(supabase, i.id).then(() => toggleInviteIgnored(i.id))
    })) : [];
    setInvites(cardData);
    */
  }, []);

  useEffect(() => {
    setDisplayList(invites.filter((i) => showIgnored || !i.ignored));
  }, [showIgnored, invites]);

  useEffect(() => {
    setIgnoredCount(invites.filter((i) => i.ignored).length);
  }, [invites]);

  const toggleShowIgnored = () => setShowIgnored((current) => !current);

  return (
    <div className="dashboard-notifications">
      <DashboardHeader 
        i18n={props.i18n} 
        breadcrumbs={[{ label: 'Notifications' }]}/>
        
      <main>
        <h1>Pending Invitations</h1>
        {ignoredCount > 0 && (<button onClick={toggleShowIgnored}>{showIgnored ? 'Hide Ignored' : 'Show Ignored'}</button>)}
        <div className="notification-grid">
          {displayList.length > 0 ? displayList.map((i) => (
            <NotificationCard
              key={i.id}
              inviteId={i.id}
              invitedBy={i.invited_by_name ? i.invited_by_name : 'a secret admirer'}
              projectName={i.project_name ? i.project_name : 'a secret project'}
              onAccept={i.onAccept}
              onIgnore={i.onIgnore}
              onUnignore={i.onUnignore}
              ignored={i.ignored}
            />
          )) : (
            <p>You have no invitations pending at the moment!</p>
          )}
        </div>
      </main>
    </div>
  )
}