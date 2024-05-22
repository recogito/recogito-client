import { useEffect, useState } from 'react';
import type {
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
} from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile } from '@backend/crud';
import { useOrganizationPolicies } from '@backend/hooks';
import { ToastProvider, Toast, ToastContent } from '@components/Toast';
import { Header, type SortFunction } from './Header';
import { ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';
import { ProjectsList } from './List';
import { ProfileNagDialog } from '@components/ProfileNagDialog';
import { TopBar } from '@components/TopBar';
import type { ToggleDisplayOptions } from '@components/ToggleDisplay';

import './ProjectsHome.css';

export interface ProjectsHomeProps {
  i18n: Translations;

  me: MyProfile;

  projects: ExtendedProjectData[];

  invitations: Invitation[];
}

export enum ProjectFilter {
  MINE,
  SHARED,
  PUBLIC,
}

export const ProjectsHome = (props: ProjectsHomeProps) => {
  const { t } = props.i18n;

  const { me } = props;

  const [projects, setProjects] = useState<ExtendedProjectData[]>(
    props.projects
  );

  const policies = useOrganizationPolicies();

  const [invitations, setInvitations] = useState<Invitation[]>(
    props.invitations
  );

  const [error, setError] = useState<ToastContent | null>(null);

  const [filter, setFilter] = useState(ProjectFilter.MINE);

  const [search, setSearch] = useState('');

  const [sort, setSort] = useState<SortFunction | undefined>();

  const [sortType, setSortType] = useState('');

  const [showProfileNag, setShowProfileNag] = useState(false);

  const [display, setDisplay] = useState<ToggleDisplayOptions>('cards');

  const isReader = policies ? !policies.get('projects').has('INSERT') : true;

  useEffect(() => {
    getMyProfile(supabase).then(({ error }) => {
      if (error) window.location.href = `/${props.i18n.lang}/sign-in`;
    });
  }, []);

  useEffect(() => {
    const hasFirstName = me.first_name && me.first_name.length;
    const hasLastName = me.last_name && me.last_name.length;
    const hasNickname = me.nickname && me.nickname.length;

    let show = true;
    if (hasFirstName && hasLastName) {
      show = false;
    } else {
      if (hasNickname) {
        show = false;
      }
    }

    setShowProfileNag(show);
  }, [me]);

  // Filtered projects
  const myProjects = projects.filter((p) => p.created_by?.id === me.id);

  const sharedProjects = isReader
    ? projects.filter(({ created_by, users }) =>
        users.find((user) => user.user.id === me.id && me.id !== created_by?.id)
      )
    : projects.filter(
        (p) =>
          p.created_by?.id !== me.id &&
          p.users.filter((u) => u.user.id === me.id).length > 0
      );

  const openJoinProjects = projects.filter(
    (p) =>
      me.id !== p.created_by?.id &&
      p.is_open_join &&
      p.users.filter((u) => u.user.id === me.id).length === 0
  );

  const allProjects = me.isOrgAdmin
    ? projects
    : [...new Set([...myProjects, ...sharedProjects, ...openJoinProjects])];

  const filteredProjects = isReader
    ? filter === ProjectFilter.MINE
      ? sharedProjects
      : // Am I one of the users in the groups?
      filter === ProjectFilter.PUBLIC
      ? openJoinProjects
      : []
    : // All projects
    filter === ProjectFilter.PUBLIC
    ? openJoinProjects
    : // Am I the creator?
    filter === ProjectFilter.MINE
    ? myProjects
    : // Am I one of the users in the groups?
    filter === ProjectFilter.SHARED
    ? sharedProjects
    : [];

  const onProjectCreated = (project: ExtendedProjectData) =>
    setProjects([...projects, project]);

  const onDetailsChanged = (project: ExtendedProjectData) =>
    setProjects((projects) =>
      projects.map((p) => (p.id === project.id ? project : p))
    );

  const onProjectDeleted = (project: ExtendedProjectData) =>
    setProjects((projects) => projects.filter((p) => p.id !== project.id));

  const onLeaveProject = (project: ExtendedProjectData) => {
    project.contexts = [];

    setProjects((projects) =>
      projects.map((p) => (p.id === project.id ? project : p))
    );
  };

  const onError = (error: string) =>
    setError({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });

  const onInvitationAccepted = (
    invitation: Invitation,
    project: ExtendedProjectData
  ) => {
    setInvitations((invitations) =>
      invitations.filter((i) => i.id !== invitation.id)
    );

    // Make sure we're not creating a duplicate in the list by joining a
    // project we're already a member of!
    setProjects((projects) => [
      ...projects.filter((p) => p.id !== project.id),
      project,
    ]);
  };

  const onInvitationDeclined = (invitation: Invitation) =>
    setInvitations((invitations) =>
      invitations.filter((i) => i.id !== invitation.id)
    );

  return (
    <ToastProvider>
      <div className='dashboard-projects-home'>
        <TopBar
          invitations={props.invitations}
          i18n={props.i18n}
          onError={onError}
          projects={projects}
          me={me}
          showNotifications={true}
          onInvitationAccepted={onInvitationAccepted}
          onInvitationDeclined={onInvitationDeclined}
        />
        <Header
          i18n={props.i18n}
          me={me}
          policies={policies}
          projects={
            isReader
              ? [sharedProjects, [], openJoinProjects]
              : [myProjects, sharedProjects, openJoinProjects]
          }
          invitations={invitations}
          filter={filter}
          onChangeFilter={setFilter}
          onChangeSearch={setSearch}
          onChangeSort={(fn: any, name: string): void => {
            setSort(() => fn);
            setSortType(name);
          }}
          onProjectCreated={onProjectCreated}
          onInvitationAccepted={onInvitationAccepted}
          onInvitationDeclined={onInvitationDeclined}
          onError={onError}
          onSetProjects={(projects) => setProjects(projects)}
          display={display}
          onSetDisplay={setDisplay}
        />

        {allProjects.length === 0 ? (
          policies && (
            <ProjectsEmpty
              i18n={props.i18n}
              canCreateProjects={policies.get('projects').has('INSERT')}
              invitations={invitations.length}
              onProjectCreated={onProjectCreated}
              onError={onError}
            />
          )
        ) : display === 'cards' ? (
          <ProjectsGrid
            i18n={props.i18n}
            me={me}
            projects={filteredProjects}
            search={search}
            sort={sort}
            onProjectDeleted={onProjectDeleted}
            onLeaveProject={onLeaveProject}
            onDetailsChanged={onDetailsChanged}
            onError={onError}
            orgPolicies={policies}
          />
        ) : (
          <ProjectsList
            i18n={props.i18n}
            me={me}
            projects={filteredProjects}
            search={search}
            sort={sort}
            sortType={sortType}
            onProjectDeleted={onProjectDeleted}
            onLeaveProject={onLeaveProject}
            onDetailsChanged={onDetailsChanged}
            onError={onError}
            orgPolicies={policies}
          />
        )}

        <ProfileNagDialog
          open={showProfileNag}
          i18n={props.i18n}
          onClose={() => setShowProfileNag(false)}
        />
      </div>

      <Toast content={error} onOpenChange={(open) => !open && setError(null)} />
    </ToastProvider>
  );
};
