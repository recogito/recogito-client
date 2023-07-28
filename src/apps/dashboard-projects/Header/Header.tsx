import { useEffect, useState } from 'react';
import { FunnelSimple, Kanban, MagnifyingGlass, Plus, User } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile } from '@backend/crud';
import { initProject } from '@backend/helpers';
import { AccountActions } from '@components/AccountActions';
import { Button } from '@components/Button';
import { Notifications } from '@components/Notifications';
import type { Invitation, MyProfile, ExtendedProjectData, Translations } from 'src/Types';
import { ProjectFilter } from '../ProjectsHome';

import './Header.css';

interface HeaderProps {

  i18n: Translations;

  invitations: Invitation[];

  filter: ProjectFilter;

  onChangeFilter(f: ProjectFilter): void;

  onProjectCreated(project: ExtendedProjectData): void;

  onInvitationAccepted(invitation: Invitation, project: ExtendedProjectData): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;

}

export const Header = (props: HeaderProps) => {

  const { t } = props.i18n;
  
  const { filter, onChangeFilter } = props;

  const [profile, setProfile] = useState<MyProfile | undefined>();

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);

  const onCreateProject = () => {
    if (creating)
      return;

    setCreating(true);

    initProject(supabase, t['Untitled Project'])
      .then(project => {
        props.onProjectCreated(project);
        setCreating(false);
      })
      .catch(error => {
        console.error(error);
        setCreating(false);
        props.onError('Something went wrong');
      });
  }

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ data }) => setProfile(data));
  }, []);

  return (
    <header className="dashboard-header">
      <section className="dashboard-header-top">
        <h1>
          <Kanban size={32} weight="thin" />
          <span>{t['Projects']}</span>
        </h1>

        <div
          className={profile ? 'dashboard-header-top-actions' : 'dashboard-header-top-actions loading'}>

          <Button 
            busy={creating}
            className="new-project primary sm flat"
            onClick={onCreateProject}>
            <Plus size={16} weight="bold" /> 
            <span>{t['New Project']}</span>
          </Button>

          <Notifications 
            i18n={props.i18n} 
            invitations={props.invitations} 
            onInvitationAccepted={props.onInvitationAccepted}
            onInvitationDeclined={props.onInvitationDeclined} 
            onError={props.onError} />

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
          <li
            className={filter === ProjectFilter.ALL ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.ALL)}>
            <button>{t['All']}</button>
          </li>

          <li
            className={filter === ProjectFilter.MINE ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.MINE)}>
            <button>{t['My Projects']}</button>
          </li>

          <li
            className={filter === ProjectFilter.SHARED ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.SHARED)}>
            <button>{t['Shared with me']}</button>
          </li>
        </ul>

        <ul className="dashboard-header-bottom-actions">
          <li>
            <button>
              <MagnifyingGlass size={16} /> <span>{t['Search']}</span>
            </button>
          </li>

          <li>
            <button>
              <FunnelSimple size={16} /> <span>{t['Sort']}</span>
            </button>
          </li>
        </ul>
      </section>
    </header>
  )

}