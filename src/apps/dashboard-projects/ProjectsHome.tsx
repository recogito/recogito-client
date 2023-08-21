import { useEffect, useState } from 'react';
import { Bell } from '@phosphor-icons/react';
import type { ExtendedProjectData, Invitation, MyProfile, Policies, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveProject, getMyProfile } from '@backend/crud';
import { getOrganizationPolicies } from '@backend/helpers';
import { AlertBanner } from '@components/AlertBanner';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { Header } from './Header';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

  invitations: Invitation[]; 

}

export enum ProjectFilter { ALL, MINE, SHARED };

export const ProjectsHome = (props: ProjectsHomeProps) => {

  const { t } = props.i18n;

  const { me } = props;

  const [projects, setProjects] = useState<ExtendedProjectData[]>(props.projects);

  const [policies, setPolicies] = useState<Policies | undefined>(undefined);

  const [invitations, setInvitations] = useState<Invitation[]>(props.invitations);

  const [error, setError] = useState<ToastContent | null>(null);

  const [filter, setFilter] = useState(ProjectFilter.ALL);

  useEffect(() => {
    getMyProfile(supabase)
      .then(({ error, data }) => {
        if (error) {
          window.location.href = `/${props.i18n.lang}/sign-in`;
        } else { 
          getOrganizationPolicies(supabase).then(({ error, data }) => {
            if (!error)
              setPolicies(data);
          });
        }
      });
  }, []);

  // Filtered projects
  const myProjects = projects.filter(p => p.created_by?.id === me.id);

  const sharedProjects = projects.filter(({ created_by, groups }) => 
    groups.find(({ members }) => 
      members.find(m => m.user.id === me.id) && me.id !== created_by?.id));

  // All projects are different for admins vs. mere mortals
  const allProjects = me.isOrgAdmin ? projects : [...myProjects, ...sharedProjects];

  const filteredProjects = 
    // All projects
    filter === ProjectFilter.ALL ?
      allProjects :
    // Am I the creator?
    filter === ProjectFilter.MINE ? 
      myProjects :
    // Am I one of the users in the groups?
    filter === ProjectFilter.SHARED ? 
      sharedProjects : 
    [];

  const onProjectCreated = (project: ExtendedProjectData) =>
    setProjects([...projects, project]);

  const onDetailsChanged = (project: ExtendedProjectData) =>
    setProjects(projects => projects.map(p => p.id === project.id ? project : p));
    
  const onDeleteProject = (project: ExtendedProjectData) =>
    archiveProject(supabase, project.id)
      .then(() => {
        setProjects(projects => projects.filter(p => p.id !== project.id));
      })
      .catch(error => {
        console.error(error);
        setError({
          title: t['Something went wrong'],
          description: t['Could not delete the project.'],
          type: 'error'
        });
      });

  const onError = (error: string) =>
    setError({
      title: t[error] || error,
      type: 'error'
    });

  const onInvitationAccepted = (invitation: Invitation, project: ExtendedProjectData) => {
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));

    // Make sure we're not creating a duplicate in the list by joining a 
    // project we're already a member of!
    setProjects(projects => ([ 
      ...projects.filter(p => p.id !== project.id), 
      project
    ]));
  }

  const onInvitationDeclined = (invitation: Invitation) =>
    setInvitations(invitations => invitations.filter(i => i.id !== invitation.id));

  return (
    <ToastProvider>
      <div className="dashboard-projects-home">
        <AlertBanner id="welcome-to-the-beta">
          <h1>Herzlich Willkommen zum Beta-Test!</h1>
          <p>
            Ihre Projektliste ist im Moment wahrscheinlich noch leer. {invitations.length > 0 ? (
              <> In ihren Benachrichtigungen <Bell className="text-bottom swing" size={16} /> wartet bereits eine Einladung zu unserem Musterprojekt.</>
            ) : (
              <> In ihren Benachrichtigungen <Bell className="text-bottom swing" size={16} /> sollte bereits eine Einladung zu unserem Musterprojekt auf Sie warten.</>
            )} Dort finden Sie alles, was sie für den Start benötigen. 
          </p>
          <p>
            Viel Spaß beim Erkunden - wir freuen uns auf Ihr Feedback!
          </p>
        </AlertBanner>

        <Header 
          i18n={props.i18n} 
          me={me}
          policies={policies}
          invitations={invitations} 
          filter={filter}
          counts={[allProjects.length, myProjects.length, sharedProjects.length]}
          onChangeFilter={setFilter}
          onProjectCreated={onProjectCreated} 
          onInvitationAccepted={onInvitationAccepted}
          onInvitationDeclined={onInvitationDeclined} 
          onError={onError} />

        {projects.length === 0 ? policies && (
          <ProjectsEmpty 
            i18n={props.i18n} 
            canCreateProjects={policies.get('projects').has('INSERT')}
            invitations={invitations.length}
            onProjectCreated={onProjectCreated} 
            onError={onError} />
        ) : (
          <ProjectsGrid 
            i18n={props.i18n} 
            projects={filteredProjects} 
            onProjectDeleted={onDeleteProject} 
            onDetailsChanged={onDetailsChanged} 
            onError={onError} />  
        )}
      </div>

      <Toast
        content={error}
        onOpenChange={open => !open && setError(null)} />
    </ToastProvider>
  )
  
}