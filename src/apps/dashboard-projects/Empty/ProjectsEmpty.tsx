import { useState } from 'react';
import { RocketLaunch } from '@phosphor-icons/react';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { Button } from '@components/Button';
import { initProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';

export interface ProjectsEmptyProps {

  i18n: Translations;

  onProjectCreated(project: ExtendedProjectData): void;

  onError(error: string): void;

}

export const ProjectsEmpty = (props: ProjectsEmptyProps) => {

  const { t } = props.i18n;

  const [fetching, setFetching] = useState(false);

  const onCreateProject = () => {
    if (fetching)
      return;

    setFetching(true);

    initProject(supabase, t['Untitled Project'])
      .then(project => {
        props.onProjectCreated(project);
        setFetching(false);
      })
      .catch(error => {
        console.error(error);
        setFetching(false);
        props.onError('Something went wrong');
      });
  }
  
  return (
    <main className="dashboard-projects-empty">
      <div className="container">
        <h1 className="dashboard-projects-tagline">
          {t['Empty Dashboard? Infinite Possibilities!']}
        </h1>

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