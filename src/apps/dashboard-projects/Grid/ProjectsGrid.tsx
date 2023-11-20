import { ProjectCard } from '@components/ProjectCard';
import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';
import type { SortFunction } from '../Header/HeaderActionSort';

export interface ProjectsGridProps {

  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

  sort?: SortFunction;

  onProjectDeleted(project: ExtendedProjectData): void;

  onDetailsChanged(project: ExtendedProjectData): void;

  onError(error: string): void;

}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  const sorted = props.sort ? props.projects.slice().sort(props.sort) : props.projects;

  return (
    <main>
      <section>
        <div className="dashboard-projects-grid">
          {sorted.map(project => (
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