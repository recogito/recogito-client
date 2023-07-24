import { useEffect, useState } from 'react';
import type { Project, Translations } from 'src/Types';
import { ProjectCard } from '@components/ProjectCard';

export interface ProjectsGridProps {

  i18n: Translations;

  projects: Project[];

  onCreateProject(): void;

  onDeleteProject(project: Project): void;

  onRenameProject(project: Project): void;

}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  const [fetching, setFetching] = useState(false);

  const onCreateProject = () => {
    if (fetching)
      return;

    setFetching(true);
    props.onCreateProject();
  }

  useEffect(() => {
    setFetching(false);
  }, [props.projects]);

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