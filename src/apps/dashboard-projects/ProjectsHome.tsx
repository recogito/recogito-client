import { useEffect, useState } from 'react';
import { Hammer } from '@phosphor-icons/react';
import type { Invitation, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { deleteProject, getMyProfile } from '@backend/crud';
import { initProject } from '@backend/helpers';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { Header } from './Header';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  i18n: Translations;

  projects: Project[];

  invitations: Invitation[]; 

}

export const ProjectsHome = (props: ProjectsHomeProps) => {

  const { t, lang } = props.i18n;

  const [projects, setProjects] = useState<Project[]>(props.projects);

  const [invitations, setInvitations] = useState<Invitation[]>(props.invitations);

  const [error, setError] = useState<ToastContent | null>(null);

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ error }) => {
        if (error)
          window.location.href = `/${props.i18n.lang}/sign-in`;
      })
  }, []);

  const onCreateProject = () =>
    initProject(supabase, t['Untitled Project'])
      .then(({ project }) => {
        setProjects([...projects, project]);
      })
      .catch(error => {
        console.error(error);
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the project.'], 
          type: 'error' 
        });
      });

  const onRenameProject = (project: Project) => {
    setError({
      icon: <Hammer size={16} className="text-bottom" />,
      title: t['We\'re working on it!'],
      description: t['This feature will become available soon.'],
      type: 'info'
    });
  }
    
  const onDeleteProject = (project: Project) =>
    deleteProject(supabase, project.id).then(({ error, data }) => {
      if (error) {
        console.error(error);
        setError({
          title: t['Something went wrong'],
          description: t['Could not delete the project.'],
          type: 'error'
        });
      } else if (data) {
        if (data.length === 1 && data[0].id === project.id) {
          setProjects(projects.filter(p => p.id !== project.id));
        } else {
          setError({
            title: t['Something went wrong'],
            description: t['Could not delete the project.'],
            type: 'error'
          });
        }
      }
    });

  const onError = (error: string) =>
    setError({
      title: t[error] || error,
      type: 'error'
    });

  const onInvitationAccepted = (invitation: Invitation, project: Project) => {
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));
    setProjects(projects => ([ project, ...projects ]));
  }

  const onInvitationDeclined = (invitation: Invitation) =>
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));

  return (
    <ToastProvider>
      <div className="dashboard-projects-home">
        <Header 
          i18n={props.i18n} 
          invitations={invitations} 
          onCreateProject={onCreateProject} 
          onInvitationAccepted={onInvitationAccepted}
          onInvitationDeclined={onInvitationDeclined} 
          onError={onError} />

        {(projects.length === 0 && invitations.length === 0) ? (
          <ProjectsEmpty 
            i18n={props.i18n} 
            onCreateProject={onCreateProject} />
        ) : (
          <ProjectsGrid 
            i18n={props.i18n} 
            projects={projects}
            onCreateProject={onCreateProject} 
            onDeleteProject={onDeleteProject} 
            onRenameProject={onRenameProject} />  
        )}
      </div>

      <Toast
        content={error}
        onOpenChange={open => !open && setError(null)} />
    </ToastProvider>
  )
  
}