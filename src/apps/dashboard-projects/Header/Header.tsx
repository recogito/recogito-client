import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { CreateProjectDialog } from '@components/CreateProjectDialog';
import { HeaderSearchAction } from '@components/Search';
import { HeaderSortAction, type SortFunction } from '@components/Sort';
import { HeaderFilterAction, type Filters } from '@components/Filter';
import {
  ToggleDisplay,
  type ToggleDisplayValue,
} from '@components/ToggleDisplay';
import { ProjectFilter } from '../ProjectsHome';
import type {
  Invitation,
  MyProfile,
  ExtendedProjectData,
  Translations,
  Policies,
} from 'src/Types';

import './Header.css';

interface HeaderProps {
  i18n: Translations;

  me: MyProfile;

  policies?: Policies;

  projects: ExtendedProjectData[][];

  invitations: Invitation[];

  filter: ProjectFilter;

  onChangeFilter(f: ProjectFilter): void;

  onChangeDisplay(f: Filters): void;

  onChangeSort(sortFn: SortFunction, name: string): void;

  onChangeSearch(value: string): void;

  onProjectCreated(project: ExtendedProjectData): void;

  onInvitationAccepted(
    invitation: Invitation,
    project: ExtendedProjectData
  ): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;

  onSetProjects(projects: ExtendedProjectData[]): void;

  display: ToggleDisplayValue;

  onSetDisplay(display: ToggleDisplayValue): void;
}

export const Header = (props: HeaderProps) => {
  const { t } = props.i18n;

  const { filter, onChangeFilter } = props;

  const [mine, shared, openJoin] = props.projects;

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

  const isReader = props.policies
    ? !props.policies.get('projects').has('INSERT')
    : true;

  const onCreateProject = () => {
    if (creating) return;

    setCreateProjectOpen(true);

    setCreating(true);
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
          setCreating(false);
          props.onProjectCreated(data);
          window.location.href = `/${props.i18n.lang}/projects/${data[0].id}`;
        }
      });
  };

  return (
    <header className='dashboard-header'>
      <section className='dashboard-header-top'>
        <h1>
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
        </div>
      </section>

      <section className='dashboard-header-bottom'>
        <ul className='dashboard-header-tabs'>
          <li
            className={filter === ProjectFilter.MINE ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.MINE)}
          >
            <button>{t['My Projects']}</button>

            <span className={mine.length === 0 ? 'badge disabled' : 'badge'}>
              {mine.length}
            </span>
          </li>

          {!isReader && (
            <li
              className={filter === ProjectFilter.SHARED ? 'active' : undefined}
              onClick={() => onChangeFilter(ProjectFilter.SHARED)}
            >
              <button>{t['Shared with me']}</button>

              <span
                className={shared.length === 0 ? 'badge disabled' : 'badge'}
              >
                {shared.length}
              </span>
            </li>
          )}

          <li
            className={filter === ProjectFilter.PUBLIC ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.PUBLIC)}
          >
            <button>{t['Public Projects']}</button>

            <span
              className={openJoin.length === 0 ? 'badge disabled' : 'badge'}
            >
              {openJoin.length}
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
            <HeaderFilterAction
              i18n={props.i18n}
              onChangeFilter={props.onChangeDisplay}
            />
          </li>
          <li>
            <HeaderSortAction
              i18n={props.i18n}
              onChangeSort={props.onChangeSort}
            />
          </li>
          <li>
            <ToggleDisplay
              display={props.display}
              onChangeDisplay={props.onSetDisplay}
            />
          </li>
        </ul>
        <CreateProjectDialog
          open={createProjectOpen}
          onClose={() => {
            setCreateProjectOpen(false);
            setCreating(false);
          }}
          onSaveProject={handleSaveProject}
          i18n={props.i18n}
        />
      </section>
    </header>
  );
};
