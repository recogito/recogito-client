import { ProjectFilter } from '@apps/dashboard-projects';
import { Button } from '@components/Button';
import {
  CaretLeft,
  CaretRight,
  File,
  Plus,
  TagSimple,
  Users,
  UsersThree
} from '@phosphor-icons/react';
import { useState } from 'react';
import type { ExtendedProjectData, Policies, Translations } from 'src/Types.ts';
import './Sidebar.css';

interface Props {
  filter: ProjectFilter;

  i18n: Translations;

  onChangeFilter:(filter: ProjectFilter) => void;

  policies?: Policies;

  projects: ExtendedProjectData[][];
}

export const Sidebar = (props: Props) => {
  const [open, setOpen] = useState<boolean>(true);

  const { filter, onChangeFilter } = props;
  const { t } = props.i18n;
  const [mine, shared, openJoin] = props.projects;

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
          >
            <CaretRight />
          </Button>
        </section>
      </aside>
    );
  }

  return (
    <aside className='dashboard-sidebar open'>

      <section className='dashboard-sidebar-header'>
        <h1>
          <span>{t['Projects']}</span>
        </h1>
        <button
          className='primary flat compact'
          onClick={() => setOpen(false)}
        >
          <CaretLeft />
        </button>
      </section>

      <section className='dashboard-sidebar-filters'>

        <ul className='dashboard-sidebar-tabs'>
          <li
            className={filter === ProjectFilter.MINE ? 'active' : undefined}
            onClick={() => onChangeFilter(ProjectFilter.MINE)}
          >
            <File
              className='icon'
              size={20}
            />

            {t['My Projects']}

            <span className={mine.length === 0 ? 'badge disabled' : 'badge'}>
              {mine.length}
            </span>
          </li>

          {!isReader && (
            <li
              className={filter === ProjectFilter.SHARED ? 'active' : undefined}
              onClick={() => onChangeFilter(ProjectFilter.SHARED)}
            >
              <Users
                className='icon'
                size={20}
              />
              {t['Shared with me']}

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
            <UsersThree
              className='icon'
              size={20}
            />

            {t['Public Projects']}

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
            <span>{t['Groups']}</span>
          </h2>
          <button
            className='primary flat compact'
          >
            <Plus />
          </button>
        </div>

        <ul className='dashboard-sidebar-groups-list'>
          <li>
            <TagSimple
              className='icon'
              size={20}
            />

            Group 1
          </li>
          <li>
            <TagSimple
              className='icon'
              size={20}
            />

            Group 2
          </li>
        </ul>
      </section>
    </aside>
  );
};