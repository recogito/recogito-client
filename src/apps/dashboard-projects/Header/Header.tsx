import { importProject } from '@backend/helpers';
import { Button } from '@components/Button';
import { ConfirmedAction } from '@components/ConfirmedAction';
import { SelectRecordsDialog } from '@components/SelectRecordsDialog';
import { TagDefinitionDialog } from '@components/TagDefinitionDialog';
import * as Dropdown from '@radix-ui/react-dropdown-menu';
import { TagContext } from '@components/TagContext';
import { useCallback, useContext, useState } from 'react';
import { CaretDown, PencilSimple, Plus, Trash } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { CreateProjectDialog } from '@components/CreateProjectDialog';
import { HeaderSearchAction } from '@components/Search';
import { type FileRejection, useDropzone } from 'react-dropzone';
import { HeaderSortAction, type SortFunction } from './Sort';
import { HeaderFilterAction, type Filters } from './Filter';
import {
  ToggleDisplay,
  type ToggleDisplayValue,
} from '@components/ToggleDisplay';
import type {
  MyProfile,
  ExtendedProjectData,
  Policies,
  Project,
  TagDefinition,
  Tag,
} from 'src/Types';
import { useTranslation } from 'react-i18next';

import './Header.css';

interface HeaderProps {
  filter: string;

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
  const { lang, t, i18n } = useTranslation(['common', 'dashboard-projects']);

  // 'Create new project' button state
  const [creating, setCreating] = useState(false);
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [selectProjectsOpen, setSelectProjectsOpen] = useState(false);
  const [tagDefinitionOpen, setTagDefinitionOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const {
    onDeleteTagDefinition,
    onSaveTagsForTargets,
    onUpdateTagDefinition,
    setToast,
  } = useContext(TagContext);

  const onDrop = (accepted: File[]) => {
    setCreating(true);

    const [file] = accepted;

    importProject(supabase, file).then(() => {
      setCreating(false);
      window.location.href = `/${lang}/jobs`;
    });
  };

  const {
    getInputProps,
    open
  } = useDropzone({
    accept: {
      'application/zip': ['.zip']
    },
    noClick: true,
    noKeyboard: true,
    onDrop
  });

  const isOrgAdmin = props.me.isOrgAdmin;

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
          const projectUrl = `/${i18n.language}/projects/${projectId}`;

          if (props.tagDefinition) {
            onSaveTagsForTargets(props.tagDefinition.id, [projectId]).then(
              () => {
                window.location.href = projectUrl;
              }
            );
          } else {
            window.location.href = projectUrl;
          }
        }
      });
  };

  const onDeleteGroup = useCallback(() => {
    if (!props.tagDefinition) {
      return;
    }

    const { id, name } = props.tagDefinition;

    onDeleteTagDefinition(id).then(() => {
      setConfirming(false);

      if (props.onDeleteTagDefinition) {
        props.onDeleteTagDefinition();
      }

      setToast({
        title: t('Success', { ns: 'common' }),
        description: t('Successfully deleted group', { ns: 'dashboard-projects', name }),
        type: 'success',
      });
    });
  }, [props.tagDefinition]);

  const onRenameGroup = useCallback(
    (name: string) => {
      if (!props.tagDefinition) {
        return;
      }

      onUpdateTagDefinition(props.tagDefinition.id, name).then(() => {
        setTagDefinitionOpen(false);

        setToast({
          title: t('Success', { ns: 'common' }),
          description: t('Successfully renamed group', { ns: 'dashboard-projects' }),
          type: 'success',
        });
      });
    },
    [props.tagDefinition]
  );

  const onTagsSaved = useCallback(
    (projectIds: string[]) => {
      if (!props.tagDefinition) {
        return;
      }

      const { id, name } = props.tagDefinition;

      onSaveTagsForTargets(id, projectIds).then(() => {
        setSelectProjectsOpen(false);

        setToast({
          title: t('Success', { ns: 'common' }),
          description: t('Successfully updated projects in group', { ns: 'dashboard-projects', name }),
          type: 'success',
        });
      });
    },
    [props.tagDefinition]
  );

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
                      {t('Rename group', { ns: 'dashboard-projects' })}
                    </Dropdown.Item>
                    <ConfirmedAction.Trigger>
                      <Dropdown.Item className='dropdown-item'>
                        <Trash className='destructive' size={16} />
                        {t('Delete group', { ns: 'dashboard-projects' })}
                      </Dropdown.Item>
                    </ConfirmedAction.Trigger>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>

              <ConfirmedAction.Dialog
                title={t('Are you sure?', { ns: 'common' })}
                description={t('Are you sure you want to delete this group?', { ns: 'dashboard-projects' })}
                cancelLabel={t('Cancel', { ns: 'common' })}
                confirmLabel={
                  <>
                    <Trash size={16} /> <span>{t('Delete group', { ns: 'dashboard-projects' })}</span>
                  </>
                }
                onConfirm={onDeleteGroup}
              />
            </ConfirmedAction.Root>
          )}
        </h2>

        <div className='dashboard-header-actions'>
          <ul className='dashboard-header-list-actions'>
            <li>
              <HeaderSearchAction
                onChangeSearch={props.onChangeSearch}
              />
            </li>
            <li>
              <HeaderFilterAction
                onChangeFilter={props.onChangeDisplay}
              />
            </li>
            <li>
              <HeaderSortAction
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
                  <button className='new-project primary sm flat'>
                    <Plus size={16} weight='bold' />
                    <span>{t('Add Project', { ns: 'dashboard-projects' })}</span>
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
                        {t('New Project', { ns: 'dashboard-projects' })}
                      </Dropdown.Item>
                    )}

                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={() => setSelectProjectsOpen(true)}
                    >
                      {t('Existing Project', { ns: 'dashboard-projects' })}
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>
            )}

            {!props.tagDefinition && props.policies?.get('projects').has('INSERT') && isOrgAdmin && (
              <Dropdown.Root>
                <Dropdown.Trigger asChild>
                  <button className='new-project primary sm flat'>
                    <Plus size={16} weight='bold' />
                    <span>{t['New Project']}</span>
                    <CaretDown size={16} />
                  </button>
                </Dropdown.Trigger>

                <Dropdown.Portal>
                  <Dropdown.Content
                    className='dropdown-content'
                    sideOffset={10}
                  >
                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={onCreateProject}
                    >
                      {t['Create Project']}
                    </Dropdown.Item>

                    <Dropdown.Item
                      className='dropdown-item'
                      onSelect={open}
                    >
                      {t('Import Project', { ns: 'dashboard-projects' })}
                    </Dropdown.Item>
                  </Dropdown.Content>
                </Dropdown.Portal>
              </Dropdown.Root>
            )}

            {!props.tagDefinition && props.policies?.get('projects').has('INSERT') && !isOrgAdmin && (
                <Button
                  busy={creating}
                  className='new-project primary sm flat'
                  onClick={onCreateProject}
                >
                  <Plus size={16} weight='bold' />
                  <span>{t('New Project', { ns: 'dashboard-projects' })}</span>
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
        />

        <TagDefinitionDialog
          onCancel={() => setTagDefinitionOpen(false)}
          onSaved={onRenameGroup}
          open={tagDefinitionOpen}
          tagDefinition={props.tagDefinition}
          title={t('Rename Project Group', { ns: 'dashboard-projects' })}
          description=''
        />

        {props.tagDefinition && (
          <SelectRecordsDialog
            columns={[
              {
                name: 'name',
                label: t('Name', { ns: 'common' }),
                resolve: ({ name }: Project) => name,
              },
              {
                name: 'count',
                label: t('Description', { ns: 'dashboard-projects' }),
                resolve: ({ description }: Project) => description,
              },
            ]}
            description={t('Select Projects', { ns: 'common' })}
            filterBy={['name', 'description']}
            header={t('All Projects', { ns: 'dashboard-projects' })}
            onCancel={() => setSelectProjectsOpen(false)}
            onSave={onTagsSaved}
            open={selectProjectsOpen}
            records={props.projects}
            selected={props.tagDefinition.tags?.map(
              (tag: Tag) => tag.target_id
            )}
            subtitle={t('Select project(s) to add to group', { ns: 'dashboard-projects' })}
            title={t('Add projects to group', { ns: 'dashboard-projects', name: props.tagDefinition.name })}
          />
        )}
        <input
          {...getInputProps()}
          aria-label={t('drag and drop target for documents', { ns: 'a11y' })}
        />
      </section>
    </header>
  );
};
