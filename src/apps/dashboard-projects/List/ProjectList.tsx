import { ProjectsEntry } from './ProjectEntry';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
  Translations,
} from 'src/Types';
import type { SortFunction } from '../Header';
import { CaretDown } from '@phosphor-icons/react';
import './ProjectList.css';

export interface ProjectsListProps {
  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

  search: string;

  orgPolicies: Policies | undefined;

  sort?: SortFunction;

  sortType: string;

  onProjectDeleted(project: ExtendedProjectData): void;

  onLeaveProject(project: ExtendedProjectData): void;

  onDetailsChanged(project: ExtendedProjectData): void;

  onError(error: string): void;
}

const filterBySearch = (projects: ExtendedProjectData[], search: string) => {
  const regex = new RegExp(search, 'i');

  return projects.filter(
    (p) => regex.test(p.name) || (p.description && regex.test(p.description))
  );
};

export const ProjectsList = (props: ProjectsListProps) => {
  const sorted = props.sort
    ? props.projects.slice().sort(props.sort)
    : props.projects;

  const filteredBySearch = props.search
    ? filterBySearch(sorted, props.search)
    : sorted;

  const showDocs = props.orgPolicies
    ? props.orgPolicies.get('projects').has('INSERT')
    : false;

  const { t } = props.i18n;

  return (
    <main>
      <section>
        <div className='dashboard-projects-list'>
          <div className='project-list-header'>
            <div className='project-list-header-name text-body-small-bold'>
              {t['Name']} {props.sortType === 'Name' ? <CaretDown /> : ''}
            </div>
            <div className='project-list-header-description text-body-small-bold'>
              {t['Description']}
            </div>
            <div
              className={
                showDocs
                  ? 'project-list-header-assignments-with-docs text-body-small-bold'
                  : 'project-list-header-assignments text-body-small-bold'
              }
            >
              {t['Assignments']}
            </div>
            {showDocs && (
              <div className='project-list-header-texts text-body-small-bold'>
                {t['Texts']}
              </div>
            )}
            {showDocs && (
              <div className='project-list-header-images text-body-small-bold'>
                {t['Images']}
              </div>
            )}
            <div className='project-list-header-team text-body-small-bold'>
              {t['Team']}
            </div>
            <div className='project-list-header-actions' />
          </div>
          <div className='project-list-list'>
            {filteredBySearch.map((project) => (
              <ProjectsEntry
                key={project.id}
                i18n={props.i18n}
                me={props.me}
                project={project}
                onDeleted={() => props.onProjectDeleted(project)}
                onLeaveProject={() => props.onLeaveProject(project)}
                onDetailsChanged={props.onDetailsChanged}
                onError={props.onError}
                orgPolicies={props.orgPolicies}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};
