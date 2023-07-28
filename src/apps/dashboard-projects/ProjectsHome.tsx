import { useEffect, useState } from 'react';
import { Hammer } from '@phosphor-icons/react';
import type { ExtendedProjectData, Invitation, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { deleteProject, getMyProfile } from '@backend/crud';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { Header } from './Header';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';
import type { User } from '@supabase/supabase-js';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  i18n: Translations;

  me: User;

  projects: ExtendedProjectData[];

  invitations: Invitation[]; 

}

export enum ProjectFilter { ALL, MINE, SHARED };

export const ProjectsHome = (props: ProjectsHomeProps) => {

  const { t } = props.i18n;

  const { me } = props;

  const [projects, setProjects] = useState<ExtendedProjectData[]>(props.projects);

  const [invitations, setInvitations] = useState<Invitation[]>(props.invitations);

  const [error, setError] = useState<ToastContent | null>(null);

  const [filter, setFilter] = useState(ProjectFilter.ALL);

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ error }) => {
        if (error)
          window.location.href = `/${props.i18n.lang}/sign-in`;
      })
  }, []);

  const filteredProjects = 
    // All projects
    filter === ProjectFilter.ALL ?
      projects : 
    // Am I the creator?
    filter === ProjectFilter.MINE ? 
      projects.filter(p => p.created_by.id === me.id) : 
    // Am I one of the users in the groups?
    filter === ProjectFilter.SHARED ? 
      projects.filter(({ groups }) => 
        groups.find(({ members }) => members.find(m => m.user.id === me.id))) : 
    [];

  const onProjectCreated = (project: ExtendedProjectData) =>
    setProjects([...projects, project]);

  const onRenameProject = (project: ExtendedProjectData) => {
    setError({
      icon: <Hammer size={16} className="text-bottom" />,
      title: t['We\'re working on it!'],
      description: t['This feature will become available soon.'],
      type: 'info'
    });
  }
    
  const onDeleteProject = (project: ExtendedProjectData) =>
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

  const onInvitationAccepted = (invitation: Invitation, project: ExtendedProjectData) => {
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));
    setProjects(projects => ([ project, ...projects ]));
  }

  const onInvitationDeclined = (invitation: Invitation) =>
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));

  return (
    <ToastProvider>
      <div className="dashboard-projects-home">
        <Header 
          filter={filter}
          i18n={props.i18n} 
          invitations={invitations} 
          onChangeFilter={setFilter}
          onProjectCreated={onProjectCreated} 
          onInvitationAccepted={onInvitationAccepted}
          onInvitationDeclined={onInvitationDeclined} 
          onError={onError} />

        {projects.length === 0 ? (
          <ProjectsEmpty 
            i18n={props.i18n} 
            onProjectCreated={onProjectCreated} 
            onError={onError} />
        ) : (
          <ProjectsGrid 
            i18n={props.i18n} 
            projects={filteredProjects} 
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