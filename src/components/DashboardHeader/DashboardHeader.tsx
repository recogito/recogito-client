import { useEffect, useState } from 'react';
import { Bell, User } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile } from '@backend/crud';
import { Account, Notifications } from './HeaderItems';
import type { MyProfile, Translations } from 'src/Types';

import './DashboardHeader.css'; 

interface DashboardHeaderProps {

  i18n: Translations;

}

export const DashboardHeader = (props: DashboardHeaderProps) => {

  const { lang } = props.i18n;

  const [profile, setProfile] = useState<MyProfile | undefined>();

  useEffect(() => {
    getMyProfile(supabase).then(({ data }) => setProfile(data));
  }, []);

  return (
    <header className="dashboard-header">
      <nav className="breadcrumbs">
        <ol>
          <li>
            <a href={`/${lang}/projects`}>INeedAName</a>
          </li>
        </ol>
      </nav>

      <div 
        className={profile ? 'dashboard-header-actions' : 'dashboard-header-actions loading'}>

        <Notifications i18n={props.i18n} />

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