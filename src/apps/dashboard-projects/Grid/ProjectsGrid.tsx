import { ProjectCard } from '@components/ProjectCard';
import type { ExtendedProjectData, Policies, Translations } from 'src/Types';

export interface ProjectsGridProps {

  i18n: Translations;

  projects: ExtendedProjectData[];

  policies?: Policies;

  onProjectDeleted(project: ExtendedProjectData): void;

  onDetailsChanged(project: ExtendedProjectData): void;

  onError(error: string): void;

}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  return (
    <main>
      <section>
        <div className="dashboard-projects-grid">
          {props.projects.map(project => (
            <ProjectCard 
              key={project.id} 
              i18n={props.i18n}
              project={project} 
              policies={props.policies}
              onDeleted={() => props.onProjectDeleted(project)} 
              onDetailsChanged={props.onDetailsChanged} 
              onError={props.onError} />
          ))}
        </div>
      </section>
    </main>
  )

}