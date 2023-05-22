import { RocketLaunch } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';

export interface ProjectsEmptyProps {

  i18n: Translations;

  onCreateProject(): void;

}

export const ProjectsEmpty = (props: ProjectsEmptyProps) => {

  const { i18n } = props;
  
  return (
    <main className="dashboard-projects-empty">
      <div className="container">
        <h1 className="dashboard-projects-tagline">
          {i18n['Empty Dashboard? Infinite Possibilities!']}
        </h1>

        <div className="dashboard-projects-empty-cta">
          <button className="primary" onClick={props.onCreateProject}>
            <RocketLaunch size={20} /> {i18n['Start Your First Annotation Project']}
          </button> 

          <a className="button" href="./help/tutorial">
            {i18n['Read the Tutorial']}
          </a>
        </div>
      </div>
    </main>
  )

}