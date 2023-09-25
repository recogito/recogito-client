import { ProjectCard } from '@components/ProjectCard';
import type { ExtendedProjectData, MyProfile, Translations } from 'src/Types';

export interface ProjectsGridProps {

  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

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