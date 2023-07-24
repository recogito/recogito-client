import { useEffect, useState } from 'react';
import { FunnelSimple, Kanban, MagnifyingGlass, Plus, User } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile } from '@backend/crud';
import { AccountActions } from '@components/AccountActions';
import { Button } from '@components/Button';
import { Notifications } from '@components/Notifications';
import type { Invitation, MyProfile, Translations } from 'src/Types';

import './Header.css';

interface HeaderProps {

  i18n: Translations;

  invitations: Invitation[];

  onCreateProject(): void;

}

export const Header = (props: HeaderProps) => {

  const [profile, setProfile] = useState<MyProfile | undefined>();

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ data }) => setProfile(data));
  }, []);

  return (
    <header className="dashboard-header">
      <section className="dashboard-header-top">
        <h1>
          <Kanban size={32} weight="thin" />
          <span>Projects</span>
        </h1>

        <div
          className={profile ? 'dashboard-header-top-actions' : 'dashboard-header-top-actions loading'}>

          <Button 
            className="new-project primary sm flat"
            onClick={props.onCreateProject}>
            <Plus size={16} weight="bold" /> <span>New Project</span>
          </Button>

          <Notifications 
            i18n={props.i18n} 
            count={props.invitations.length} />

          {profile ? (
            <AccountActions i18n={props.i18n} profile={profile} />
          ) : (
            <button 
              className="unstyled icon-only avatar-placeholder"
              disabled>
              <User
                size={18} />
            </button>
          )}
        </div>
      </section>

      <section className="dashboard-header-bottom">
        <ul className="dashboard-header-tabs">
          <li className="active">
            <button>All</button>
          </li>

          <li>
            <button>My Projects</button>
          </li>

          <li>
            <button>Shared with me</button>
          </li>
        </ul>

        <ul className="dashboard-header-bottom-actions">
          <li>
            <button>
              <MagnifyingGlass size={16} /> <span>Search</span>
            </button>
          </li>

          <li>
            <button>
              <FunnelSimple size={16} /> <span>Sort</span>
            </button>
          </li>
        </ul>
      </section>
    </header>
  )

}