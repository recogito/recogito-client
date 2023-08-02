import { useState } from 'react';
import { Bell, RocketLaunch } from '@phosphor-icons/react';
import type { ExtendedProjectData, Translations } from 'src/Types';
import { Button } from '@components/Button';
import { initProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';

export interface ProjectsEmptyProps {

  i18n: Translations;

  canCreateProjects: boolean;

  invitations: number;

  onProjectCreated(project: ExtendedProjectData): void;

  onError(error: string): void;

}

export const ProjectsEmpty = (props: ProjectsEmptyProps) => {

  const { canCreateProjects, invitations } = props;

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
          {canCreateProjects ? (
            t['Empty Dashboard? Infinite possibilities!']
          ) : (
            t['Empty Dashboard? Bear with us!']
          )}
          
        </h1>

        <div className="dashboard-projects-empty-cta">
          {canCreateProjects ? (
            <Button 
              className="primary lg" 
              onClick={onCreateProject}
              busy={fetching}>
              <RocketLaunch size={20} /> <span>{t['Start Your First Annotation Project']}</span>
            </Button> 
          ) : (
            <p className="no-creator-rights">
              {t['You don\'t have creator rights']} {invitations === 0 ? (
                <span dangerouslySetInnerHTML={{__html: t['Read the tutorial']}}></span>
              ) : invitations === 1 ? (
                <>
                  {t['Fret not one'].split('${icon}')[0]} <Bell size={18} />
                  {t['Fret not one'].split('${icon}')[1]}
                </>
              ) : (
                <>
                  {t['Fret not more'].split('${icon}')[0].replace('${count}', `${invitations}`)} <Bell size={18} />
                  {t['Fret not more'].split('${icon}')[1]}
                </>
              )}
            </p>
          )}
        </div>
      </div>
    </main>
  )

}