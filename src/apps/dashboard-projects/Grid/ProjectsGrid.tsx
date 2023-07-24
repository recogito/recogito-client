import { useEffect, useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { animated, easings, useTransition} from '@react-spring/web';
import type { Invitation, Project, Translations } from 'src/Types';
import { Button } from '@components/Button';
import { ProjectCard } from '@components/ProjectCard';
import { InvitationCard } from '@components/InvitationCard';

export interface ProjectsGridProps {

  i18n: Translations;

  projects: Project[];

  invitations: Invitation[];

  onCreateProject(): void;

  onDeleteProject(project: Project): void;

  onRenameProject(project: Project): void;

  onInvitationAccepted(invitation: Invitation, project: Project): void;

  onInvitationDeclined(invitation: Invitation): void;

  onError(error: string): void;

}

export const ProjectsGrid = (props: ProjectsGridProps) => {

  const { t } = props.i18n;

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

  const hasInvitations = props.invitations.length > 0;
  
  return (
    <main>
      <section>
        {hasInvitations && (
          <div className="dashboard-projects-grid invitations">
            {props.invitations.map(invitation => (
              <InvitationCard
                key={invitation.id}
                invitation={invitation}
                i18n={props.i18n} 
                onAccepted={project => props.onInvitationAccepted(invitation, project)} 
                onDeclined={() => props.onInvitationDeclined(invitation)} 
                onError={props.onError} />
            ))}
          </div>
        )}

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