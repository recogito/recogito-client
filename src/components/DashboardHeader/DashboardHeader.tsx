import { useEffect, useState } from 'react';
import { User } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile, listMyInvites } from '@backend/crud';
import { Account, Notifications } from './HeaderItems';
import type { MyProfile, Translations } from 'src/Types';

import './DashboardHeader.css'; 

interface DashboardHeaderProps {

  i18n: Translations;

  breadcrumbs?: Array<{label: string, url?: string}>;

}

export const DashboardHeader = (props: DashboardHeaderProps) => {

  const { lang, t } = props.i18n;

  const [profile, setProfile] = useState<MyProfile | undefined>();

  const [notifications, setNotifications] = useState<number>(0);

  const breadcrumbs = props.breadcrumbs || [];

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ data }) => setProfile(data));

    listMyInvites(supabase)
      .then(({ data }) => setNotifications(data ? data.length : 0));
  }, []);

  return (
    <header className="dashboard-header">
      <nav className="breadcrumbs">
        <ol>
          <li>
            <a href={`/${lang}/projects`}>INeedAName</a>
          </li>

          {breadcrumbs.map(({ label, url }) => (
            <li>
              <a href={url}>{t[label]}</a>
            </li>
          ))}
        </ol>
      </nav>

      <div 
        className={profile ? 'dashboard-header-actions' : 'dashboard-header-actions loading'}>

        <Notifications 
          i18n={props.i18n} 
          count={notifications} />

        {profile ? (
          <Account i18n={props.i18n} profile={profile} />
        ) : (
          <button 
            className="unstyled icon-only avatar-placeholder"
            disabled>
            <User
              size={18} />
          </button>
        )}
      </div>
    </header>
  )

}