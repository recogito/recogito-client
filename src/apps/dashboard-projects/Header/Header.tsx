import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { AccountActions } from '@components/AccountActions';
import { Button } from '@components/Button';
import { Notifications } from '@components/Notifications';
import { RecogitoLogo } from '@components/RecogitoLogo';
import type {
  Invitation,
  MyProfile,
  ExtendedProjectData,
  Translations,
  Policies,
} from 'src/Types';
import { ProjectFilter } from '../ProjectsHome';
import { HeaderSearchAction } from './Search';
import { HeaderSortAction, SortFunction } from './Sort';
import { CreateProjectDialog } from '@components/CreateProjectDialog';

import './Header.css';

interface HeaderProps {
  i18n: Translations;

  me: MyProfile;

  policies?: Policies;

  projects: ExtendedProjectData[][];

  invitations: Invitation[];

  filter: ProjectFilter;

  onChangeFilter(f: ProjectFilter): void;

  onChangeSort(sortFn: SortFunction): void;

  onChangeSearch(value: string): void;

  onProjectCreated(project: ExtendedProjectData): void;

  onInvitationAccepted(
    invitation: Invitation,
    project: ExtendedProjectData
  ): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;
}

export const Header = (props: HeaderProps) => {
  const { t } = props.i18n;

  const { filter, onChangeFilter } = props;

  const [all, mine, shared] = props.projects;

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const onCreateProject = () => {
    if (creating) return;

    setCreateProjectOpen(true);

    setCreating(true);
    //
    // initProject(supabase, t['Untitled Project'])
    //   .then(project => {
    //     props.onProjectCreated(project);
    //     setCreating(false);
    //   })
    //   .catch(error => {
    //     console.error(error);
    //     setCreating(false);
    //     props.onError('Something went wrong');
    //   });
  };

  const handleSaveProject = (
    name: string,
    description: string,
    openJoin: boolean,
    openEdit: boolean
  ) => {
    supabase
      .rpc('create_project_rpc', {
        _description: description,
        _is_open_edit: openEdit,
        _is_open_join: openJoin,
        _name: name,
      })
      .then(({ data, error }) => {
        if (error) {
          setCreating(false);
          props.onError('Something went wrong');
        } else {
          props.onProjectCreated(data);
          window.location.href = `/${props.i18n.lang}/projects/${data[0].id}`;
        }
      });
  };

  return (
    <header className='dashboard-header'>
      <section className='dashboard-header-top'>
        <h1>
          <RecogitoLogo />
          <span>{t['Projects']}</span>
        </h1>

        <div className='dashboard-header-top-actions'>
          {props.policies?.get('projects').has('INSERT') && (
            <Button
              busy={creating}
              className='new-project primary sm flat'
              onClick={onCreateProject}
            >
              <Plus size={16} weight='bold' />
              <span>{t['New Project']}</span>
            </Button>
          )}

          <Notifications
            i18n={props.i18n}
            invitations={props.invitations}
            onInvitationAccepted={props.onInvitationAccepted}
            onInvitationDeclined={props.onInvitationDeclined}
            onError={props.onError}
          />

          <AccountActions i18n={props.i18n} profile={props.me} />
        </div>
      </section>

      <section className='dashboard-header-bottom'>
        <ul className='dashboard-header-tabs'>
          <li
            className={filter === ProjectFilter.ALL ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.ALL)}
          >
            <button>{t['All']}</button>

            <span className={all.length === 0 ? 'badge disabled' : 'badge'}>
              {all.length}
            </span>
          </li>

          <li
            className={filter === ProjectFilter.MINE ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.MINE)}
          >
            <button>{t['My Projects']}</button>

            <span className={mine.length === 0 ? 'badge disabled' : 'badge'}>
              {mine.length}
            </span>
          </li>

          <li
            className={filter === ProjectFilter.SHARED ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.SHARED)}
          >
            <button>{t['Shared with me']}</button>

            <span className={shared.length === 0 ? 'badge disabled' : 'badge'}>
              {shared.length}
            </span>
          </li>
        </ul>

        <ul className='dashboard-header-bottom-actions'>
          <li>
            <HeaderSearchAction
              i18n={props.i18n}
              onChangeSearch={props.onChangeSearch}
            />
          </li>

          <li>
            <HeaderSortAction
              i18n={props.i18n}
              onChangeSort={props.onChangeSort}
            />
          </li>
        </ul>
        <CreateProjectDialog
          open={createProjectOpen}
          onClose={() => setCreateProjectOpen(false)}
          onSaveProject={handleSaveProject}
          i18n={props.i18n}
        />
      </section>
    </header>
  );
};
