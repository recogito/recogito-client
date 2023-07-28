import { ProjectCard } from '@components/ProjectCard';
import type { ExtendedProjectData, Translations } from 'src/Types';

export interface ProjectsGridProps {

  i18n: Translations;

  projects: ExtendedProjectData[];

  onDeleteProject(project: ExtendedProjectData): void;

  onRenameProject(project: ExtendedProjectData): void;

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
              onDelete={() => props.onDeleteProject(project)} 
              onRename={() => props.onRenameProject(project)}/>
          ))}
        </div>
      </section>
    </main>
  )

}