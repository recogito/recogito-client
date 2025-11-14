import { ProjectFilter } from '@apps/dashboard-projects';
import { TagDefinitionDialog } from '@components/TagDefinitionDialog';
import { Button } from '@components/Button';
import {
  CaretLeft,
  CaretRight,
  File,
  Plus,
  TagSimple,
  Users,
  UsersThree,
} from '@phosphor-icons/react';
import { TagContext } from '@components/TagContext';
import { useCallback, useContext, useState } from 'react';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
} from 'src/Types.ts';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

interface Props {
  filter: ProjectFilter | string;

  me: MyProfile;

  onChangeFilter: (filter: ProjectFilter | string) => void;

  policies?: Policies;

  projects: ExtendedProjectData[][];
}

export const Sidebar = (props: Props) => {
  const [addTagDefinition, setAddTagDefinition] = useState<boolean>(false);
  const [open, setOpen] = useState<boolean>(true);

  const { filter, onChangeFilter } = props;
  const { t } = useTranslation(['common', 'dashboard-projects', 'a11y']);
  const [mine, shared, openJoin] = props.projects;

  const { tagDefinitions, onCreateTagDefinition, setToast } =
    useContext(TagContext);

  const onSaved = useCallback(
    (name: string) =>
      onCreateTagDefinition(name)
        .then(() => setAddTagDefinition(false))
        .then(() =>
          setToast({
            title: t('Success', { ns: 'common' }),
            description: t('Project group successfully added', { ns: 'dashboard-projects' }).replace(
              '${name}',
              name
            ),
            type: 'success',
          })
        ),
    []
  );

  const isReader = props.policies
    ? !props.policies.get('projects').has('INSERT')
    : true;

  if (!open) {
    return (
      <aside className='dashboard-sidebar closed'>
        <section className='dashboard-sidebar-header'>
          <Button
            className='primary flat compact'
            onClick={() => setOpen(true)}
            aria-label={t('open sidebar navigation', { ns: 'a11y' })}
          >
            <CaretRight size={16} weight='bold' />
          </Button>
        </section>
      </aside>
    );
  }

  return (
    <aside className='dashboard-sidebar open'>
      <section className='dashboard-sidebar-header'>
        <h1>
          <span>{t('Projects', { ns: 'common' })}</span>
        </h1>
        <button
          className='primary flat compact'
          onClick={() => setOpen(false)}
          aria-label={t('close sidebar', { ns: 'a11y' })}
        >
          <CaretLeft size={16} weight='bold' />
        </button>
      </section>

      <section className='dashboard-sidebar-filters'>
        <ul className='dashboard-sidebar-tabs'>
          <li
            className={filter === ProjectFilter.MINE ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.MINE)}
          >
            <File className='icon' size={20} />

            {t('My Projects', { ns: 'dashboard-projects' })}

            <span className={mine.length === 0 ? 'badge disabled' : 'badge'}>
              {mine.length}
            </span>
          </li>

          {!isReader && (
            <li
              className={filter === ProjectFilter.SHARED ? 'active' : undefined}
              onClick={() => onChangeFilter(ProjectFilter.SHARED)}
            >
              <Users className='icon' size={20} />
              {t('Shared with me', { ns: 'dashboard-projects' })}

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
            <UsersThree className='icon' size={20} />

            {t('Public Projects', { ns: 'dashboard-projects' })}

            <span
              className={openJoin.length === 0 ? 'badge disabled' : 'badge'}
            >
              {openJoin.length}
            </span>
          </li>
        </ul>
      </section>

      <section className='dashboard-sidebar-groups'>
        <div className='dashboard-sidebar-groups-header'>
          <h2>
            <span>{t('Groups', { ns: 'dashboard-projects' })}</span>
          </h2>
          <button
            className='primary flat compact'
            onClick={() => setAddTagDefinition(true)}
            aria-label={t('add project group', { ns: 'a11y' })}
          >
            <Plus size={16} weight='bold' />
          </button>
        </div>

        {tagDefinitions && tagDefinitions.length > 0 && (
          <ul className='dashboard-sidebar-groups-list'>
            {tagDefinitions.map((tagDefinition) => (
              <li
                className={filter === tagDefinition.id ? 'active' : undefined}
                key={tagDefinition.id}
                onClick={() => onChangeFilter(tagDefinition.id)}
              >
                <TagSimple className='icon' size={20} />

                {tagDefinition.name}
              </li>
            ))}
          </ul>
        )}

        <TagDefinitionDialog
          description={t('Create Project Group', { ns: 'dashboard-projects' })}
          onCancel={() => setAddTagDefinition(false)}
          onSaved={onSaved}
          open={addTagDefinition}
          title={t('Create Project Group', { ns: 'dashboard-projects' })}
        />
      </section>
    </aside>
  );
};
