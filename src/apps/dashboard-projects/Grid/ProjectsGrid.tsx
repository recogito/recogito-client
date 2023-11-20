import { ProjectCard } from '@components/ProjectCard';
import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';
import type { SortFunction } from '../Header';

export interface ProjectsGridProps {

  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

  search: string;

  sort?: SortFunction;

  onProjectDeleted(project: ExtendedProjectData): void;

  onDetailsChanged(project: ExtendedProjectData): void;

  onError(error: string): void;

}

const filterBySearch = (projects: ExtendedProjectData[], search: string) => {
  const regex = new RegExp(search, 'i');

  return projects.filter(p =>
    regex.test(p.name) || (p.description && regex.test(p.description)));
}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  const sorted = props.sort ? props.projects.slice().sort(props.sort) : props.projects;

  const filteredBySearch = props.search ? filterBySearch(sorted, props.search) : sorted;

  return (
    <main>
      <section>
        <div className="dashboard-projects-grid">
          {filteredBySearch.map(project => (
            <ProjectCard 
              key={project.id} 
              i18n={props.i18n}
              me={props.me}
              project={project}
              onDeleted={() => props.onProjectDeleted(project)} 
              onDetailsChanged={props.onDetailsChanged} 
              onError={props.onError} />
          ))}
        </div>
      </section>
    </main>
  )

}