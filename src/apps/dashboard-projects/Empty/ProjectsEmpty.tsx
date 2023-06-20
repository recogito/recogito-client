import { useState } from 'react';
import { RocketLaunch } from '@phosphor-icons/react';
import type { Translations } from 'src/Types';
import { Button } from '@components/Button';

export interface ProjectsEmptyProps {

  i18n: Translations;

  onCreateProject(): void;

}

export const ProjectsEmpty = (props: ProjectsEmptyProps) => {

  const { t } = props.i18n;

  const [fetching, setFetching] = useState(false);

  const onCreateProject = () => {
    if (fetching)
      return;

    setFetching(true);
    props.onCreateProject();
  }
  
  return (
    <main className="dashboard-projects-empty">
      <div className="container">
        <h1 className="dashboard-projects-tagline">
          {t['Empty Dashboard? Infinite Possibilities!']}
        </h1>

        <p>
          {t['You have no annotation projects.']} <a href="./help/tutorial">{t['Learn more.']}</a>
        </p>

        <div className="dashboard-projects-empty-cta">
          <Button 
            className="primary lg" 
            onClick={onCreateProject}
            busy={fetching}>
            <RocketLaunch size={20} /> <span>{t['Start Your First Annotation Project']}</span>
          </Button> 
        </div>
      </div>
    </main>
  )

}