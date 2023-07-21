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

  const bannerTransition = useTransition([hasInvitations], {
    from: { maxHeight: '0px' },
    enter: { maxHeight: hasInvitations ? '100px': '0px' },
    leave: { maxHeight: '0px' },
    config: { 
      duration: 300,
      easing: easings.easeOutCubic
    }
  });
  
  return (
    <main>
      {bannerTransition((style) => (
        <animated.div style={{ overflow: 'hidden', ...style }}>
          <section className="dashboard-banner info-banner">
            {props.invitations.length === 1 ? (
              <>
                <h1>New Invitation</h1>
                <p>
                  A new project is waiting for you to join!
                </p>
              </>
            ) : (
              <>
                <h1>{props.invitations.length} Invitations</h1>
                <p>
                  New projects are waiting for you to join!
                </p>
              </>
            )} 
          </section>
        </animated.div>
      ))}

      <section>
        <Button 
          className="primary" 
          onClick={onCreateProject}
          busy={fetching}>
          <Plus size={20} /> <span>{t['Create New Project']}</span>
        </Button>

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