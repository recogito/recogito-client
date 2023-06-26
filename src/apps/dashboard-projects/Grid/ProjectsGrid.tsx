import { useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import type { Project, Translations } from 'src/Types';
import { Button } from '@components/Button';
import { ProjectCard } from '@components/ProjectCard';

export interface ProjectsGridProps {

  i18n: Translations;

  projects: Project[];

  onCreateProject(): void;

  onDeleteProject(project: Project): void;

  onRenameProject(project: Project): void;

}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  const { t, lang } = props.i18n;

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
    <div className="dashboard-projects-home">
      <header>
        <nav className="breadcrumbs">
          <ol>
            <li>
              <a href={`/${lang}/projects`}>INeedAName</a>
            </li>

            <li>
              <a className="breadcrumb-current">{t['Projects']}</a>
            </li>
          </ol>
        </nav>
      </header>

      <main>
        <Button 
          className="primary" 
          onClick={onCreateProject}
          busy={fetching}>
          <Plus size={20} /> <span>{t['Create New Project']}</span>
        </Button>

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
      </main>
    </div>
  )

}