import { useMemo, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { Button } from '@components/Button';
import { CreateProjectDialog } from '@components/CreateProjectDialog';
import { HeaderSearchAction } from '@components/Search';
import { HeaderSortAction, type SortFunction } from './Sort';
import { HeaderFilterAction, type Filters } from './Filter';
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
  filter: string;

  i18n: Translations;

  me: MyProfile;

  policies?: Policies;

  projects: ExtendedProjectData[][];

  invitations: Invitation[];

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

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);

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
      <section className='dashboard-header-container'>
        <h2>
          { props.filter }
        </h2>

        <div className='dashboard-header-actions'>
          <ul className='dashboard-header-list-actions'>
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

          <div className='dashboard-header-button-actions'>
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
        </div>

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
