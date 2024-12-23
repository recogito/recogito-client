import { Button } from '@components/Button';
import { ConfirmedAction } from '@components/ConfirmedAction';
import { SelectRecordsDialog } from '@components/SelectRecordsDialog';
import { TagDefinitionDialog } from '@components/TagDefinitionDialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { TagContext } from '@components/TagContext';
import { useCallback, useContext, useState } from 'react';
import {
  CaretDown,
  PencilSimple,
  Plus,
  Trash
} from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { CreateProjectDialog } from '@components/CreateProjectDialog';
import { HeaderSearchAction } from '@components/Search';
import { HeaderSortAction, type SortFunction } from './Sort';
import { HeaderFilterAction, type Filters } from './Filter';
import { ToggleDisplay, type ToggleDisplayValue } from '@components/ToggleDisplay';
import type {
  MyProfile,
  ExtendedProjectData,
  Translations,
  Policies,
  Project,
  TagDefinition,
  Tag
} from 'src/Types';

import './Header.css';

interface HeaderProps {
  filter: string;

  i18n: Translations;

  me: MyProfile;

  policies?: Policies;

  projects: ExtendedProjectData[];

  onChangeDisplay(f: Filters): void;

  onChangeSort(sortFn: SortFunction, name: string): void;

  onChangeSearch(value: string): void;

  onDeleteTagDefinition?(): void;

  onProjectCreated(project: ExtendedProjectData): void;

  onError(error: string): void;

  display: ToggleDisplayValue;

  onSetDisplay(display: ToggleDisplayValue): void;

  tagDefinition?: TagDefinition;
}

export const Header = (props: HeaderProps) => {
  const { t } = props.i18n;

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectProjectsOpen, setSelectProjectsOpen] = useState(false);
  const [tagDefinitionOpen, setTagDefinitionOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const { onDeleteTagDefinition, onSaveTagsForTargets, onUpdateTagDefinition, setToast } = useContext(TagContext);

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

          const projectId = data[0]?.id;
          const projectUrl = `/${props.i18n.lang}/projects/${projectId}`;

          if (props.tagDefinition) {
            onSaveTagsForTargets(props.tagDefinition.id, [projectId])
              .then(() => {
                window.location.href = projectUrl;
              });
          } else {
            window.location.href = projectUrl
          }
        }
      });
  };

  const onDeleteGroup = useCallback(() => {
    if (!props.tagDefinition) {
      return;
    }

    const { id, name } = props.tagDefinition;

    onDeleteTagDefinition(id)
      .then(() => {
        setConfirming(false);

        if (props.onDeleteTagDefinition) {
          props.onDeleteTagDefinition();
        }

        setToast({
          title: t['Success'],
          description: t['Successfully deleted group'].replace('${name}', name),
          type: 'success'
        });
      });
  }, [props.tagDefinition]);

  const onRenameGroup = useCallback((name) => {
    if (!props.tagDefinition) {
      return;
    }

    onUpdateTagDefinition(props.tagDefinition.id, name)
      .then(() => {
        setTagDefinitionOpen(false);

        setToast({
          title: t['Success'],
          description: t['Successfully renamed group'],
          type: 'success'
        });
      });
  }, [props.tagDefinition]);

  const onTagsSaved = useCallback((projectIds) => {
    if (!props.tagDefinition) {
      return;
    }

    const { id, name } = props.tagDefinition;

    onSaveTagsForTargets(id, projectIds)
      .then(() => {
        setSelectProjectsOpen(false);

        setToast({
          title: t['Success'],
          description: t['Successfully updated projects in group'].replace('${name}', name),
          type: 'success'
        });
      });
  }, [props.tagDefinition]);

  return (
    <header className='dashboard-header'>
      <section className='dashboard-header-container'>
        <h2>

          {props.filter}

          {props.tagDefinition && (
            <ConfirmedAction.Root
              onOpenChange={setConfirming}
              open={confirming}
            >
              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <button className='icon-only unstyled'>
                    <CaretDown size={16} />
                  </button>
                </Dropdown.Trigger>

                <Dropdown.Portal>
                  <Dropdown.Content className='dropdown-content'>
                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={() => setTagDefinitionOpen(true)}
                    >
                      <PencilSimple size={16} />
                      {t['Rename group']}
                    </Dropdown.Item>
                    <ConfirmedAction.Trigger>
                      <Dropdown.Item className='dropdown-item'>
                        <Trash className='destructive' size={16} />
                        {t['Delete group']}
                      </Dropdown.Item>
                    </ConfirmedAction.Trigger>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>

              <ConfirmedAction.Dialog
                i18n={props.i18n}
                title={t['Are you sure?']}
                description={t['Are you sure you want to delete this group?']}
                cancelLabel={t['Cancel']}
                confirmLabel={<><Trash size={16} /> <span>{t['Delete group']}</span></>}
                onConfirm={onDeleteGroup}
              />
            </ConfirmedAction.Root>
          )}

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

            {props.tagDefinition && (
              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <button
                    className='new-project primary sm flat'
                  >
                    <Plus size={16} weight='bold' />
                    <span>{t['Add Project']}</span>
                    <CaretDown size={16} />
                  </button>
                </Dropdown.Trigger>

                <Dropdown.Portal>
                  <Dropdown.Content
                    className='dropdown-content'
                    sideOffset={10}
                  >

                    {props.policies?.get('projects').has('INSERT') && (
                      <Dropdown.Item
                        className='dropdown-item'
                        onSelect={onCreateProject}
                      >
                        {t['New Project']}
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={() => setSelectProjectsOpen(true)}
                    >
                      {t['Existing Project']}
                    </Dropdown.Item>

                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>
            )}

            {!props.tagDefinition && props.policies?.get('projects').has('INSERT') && (
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

        <TagDefinitionDialog
          i18n={props.i18n}
          onCancel={() => setTagDefinitionOpen(false)}
          onSaved={onRenameGroup}
          open={tagDefinitionOpen}
          tagDefinition={props.tagDefinition}
          title={t['Rename Project Group']}
        />

        {props.tagDefinition && (
          <SelectRecordsDialog
            columns={[{
              name: 'name',
              label: t['Name'],
              resolve: ({ name }: Project) => name
            }, {
              name: 'count',
              label: t['Description'],
              resolve: ({ description }: Project) => description
            }]}
            description={t['Select Projects']}
            filterBy={['name', 'description']}
            header={t['All Projects']}
            i18n={props.i18n}
            onCancel={() => setSelectProjectsOpen(false)}
            onSave={onTagsSaved}
            open={selectProjectsOpen}
            records={props.projects}
            selected={props.tagDefinition.tags?.map((tag: Tag) => tag.target_id)}
            subtite={t['Select project(s) to add to group']}
            title={t['Add projects to group'].replace('${name}', props.tagDefinition.name)}
          />
        )}

      </section>
    </header>
  );
};
