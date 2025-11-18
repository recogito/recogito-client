import { TagContext, TagContextProvider } from '@components/TagContext';
import { useContext, useEffect, useMemo, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { getMyProfile } from '@backend/crud';
import { useOrganizationPolicies } from '@backend/hooks';
import { ToastProvider, Toast, type ToastContent } from '@components/Toast';
import { Header, type Filters, type SortFunction } from './Header';
import { ProjectGroupEmpty, ProjectsEmpty } from './Empty';
import { ProjectsGrid } from './Grid';
import { ProjectsList } from './List';
import { Sidebar } from './Sidebar';
import { ProfileNagDialog } from '@components/ProfileNagDialog';
import { TopBar } from '@components/TopBar';
import type { ToggleDisplayValue } from '@components/ToggleDisplay';
import { useLocalStorageBackedState } from 'src/util/hooks';
import type {
  ExtendedProjectData,
  MyProfile,
} from 'src/Types';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

import './ProjectsHome.css';

export interface ProjectsHomeProps {

  me: MyProfile;

  projects: ExtendedProjectData[];
}

export enum ProjectFilter {
  MINE,
  SHARED,
  PUBLIC,
}

export const ProjectsHome = (props: ProjectsHomeProps) => {
  const { t, i18n } = useTranslation(['dashboard-projects']);

  const { me } = props;

  const [projects, setProjects] = useState<ExtendedProjectData[]>(
    props.projects
  );

  const policies = useOrganizationPolicies();

  const [error, setError] = useState<ToastContent | null>(null);

  const [filter, setFilter] = useState<ProjectFilter | string>(
    ProjectFilter.MINE
  );

  const [search, setSearch] = useState('');

  const [sort, setSort] = useState<SortFunction | undefined>();

  const [sortType, setSortType] = useState('');

  const [showProfileNag, setShowProfileNag] = useState(false);

  const [display, setDisplay] = useLocalStorageBackedState<ToggleDisplayValue>(
    'rs-dashboard-display',
    'cards'
  );

  const [include, setInclude] = useState<Filters>('active');

  const isReader = policies ? !policies.get('projects').has('INSERT') : true;

  const { tagDefinitions, toast, setToast } = useContext(TagContext);

  useEffect(() => {
    getMyProfile(supabase).then(({ error }) => {
      if (error) window.location.href = `/${i18n.language}/sign-in`;
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

  const openJoinProjects = me.isOrgAdmin
    ? projects.filter((p) => me.id !== p.created_by?.id && p.is_open_join)
    : projects.filter(
        (p) =>
          me.id !== p.created_by?.id &&
          p.is_open_join &&
          p.users.filter((u) => u.user.id === me.id).length === 0
      );

  const sharedProjects = isReader
    ? projects.filter(({ created_by, users }) =>
        users.find((user) => user.user.id === me.id && me.id !== created_by?.id)
      )
    : me.isOrgAdmin
    ? projects.filter((p) => p.created_by?.id !== me.id && !p.is_open_join)
    : projects.filter(
        (p) =>
          p.created_by?.id !== me.id &&
          p.users.filter((u) => u.user.id === me.id).length > 0
      );

  const tagDefinition = useMemo(
    () => tagDefinitions.find((tagDefinition) => tagDefinition.id === filter),
    [filter, tagDefinitions]
  );

  const filteredProjects = useMemo(() => {
    let value;

    if (filter === ProjectFilter.MINE) {
      value = isReader ? sharedProjects : myProjects;
    } else if (filter === ProjectFilter.SHARED) {
      value = sharedProjects;
    } else if (filter === ProjectFilter.PUBLIC) {
      value = openJoinProjects;
    } else if (tagDefinition) {
      const projectIds = tagDefinition.tags?.map((tag) => tag.target_id);
      value = projects.filter((project) => projectIds?.includes(project.id));
    }

    if (include === 'active' && value) {
      value = value.filter((p) => !p.is_locked);
    } else if (include === 'locked' && value) {
      value = value.filter((p) => p.is_locked);
    }

    return value;
  }, [filter, include, isReader, projects, tagDefinition]);

  const filterLabel = useMemo(() => {
    let value;

    if (filter === ProjectFilter.MINE) {
      value = t('My Projects', { ns: 'dashboard-projects' });
    } else if (filter === ProjectFilter.SHARED) {
      value = t('Shared with me', { ns: 'dashboard-projects' });
    } else if (filter === ProjectFilter.PUBLIC) {
      value = t('Public Projects', { ns: 'dashboard-projects' });
    } else if (tagDefinition) {
      value = tagDefinition.name;
    }

    return value;
  }, [filter, t, tagDefinition]);

  const onProjectCreated = (project: ExtendedProjectData) =>
    setProjects([...projects, project]);

  const onDetailsChanged = (project: ExtendedProjectData) =>
    setProjects((projects) =>
      projects.map((p) => (p.id === project.id ? project : p))
    );

  const onProjectDeleted = (project: ExtendedProjectData) =>
    setProjects((projects) => projects.filter((p) => p.id !== project.id));

  const onLeaveProject = (project: ExtendedProjectData) => {
    project.contexts = []; // Not sure what this is for
    setProjects((projects) => projects.filter((p) => p.id !== project.id));
  };

  const onError = (error: string) =>
    setError({
      title: t('Something went wrong', { ns: 'dashboard-projects' }),
      description: error,
      type: 'error',
    });

  const onInvitationAccepted = (project: ExtendedProjectData) => {
    // Make sure we're not creating a duplicate in the list by joining a
    // project we're already a member of!
    setProjects((projects) => [
      ...projects.filter((p) => p.id !== project.id),
      project,
    ]);
  };

  return (
    <ToastProvider>
      <div className='dashboard-projects-home'>
        <TopBar
          onError={onError}
          me={me}
          onInvitationAccepted={onInvitationAccepted}
          isCreator={!isReader}
        />
        <div className='dashboard-projects-container'>
          <Sidebar
            filter={filter}
            onChangeFilter={setFilter}
            policies={policies}
            projects={
              isReader
                ? [sharedProjects, [], openJoinProjects]
                : [myProjects, sharedProjects, openJoinProjects]
            }
            me={props.me}
          />
          <div className='dashboard-projects-content'>
            <Header
              filter={filterLabel as string}
              me={me}
              policies={policies}
              projects={[...myProjects, ...sharedProjects]}
              onChangeDisplay={setInclude}
              onChangeSearch={setSearch}
              onChangeSort={(fn: any, name: string): void => {
                setSort(() => fn);
                setSortType(name);
              }}
              onDeleteTagDefinition={() => setFilter(ProjectFilter.MINE)}
              onProjectCreated={onProjectCreated}
              onError={onError}
              display={display}
              onSetDisplay={setDisplay}
              tagDefinition={tagDefinition}
            />

            {filteredProjects?.length === 0 ? (
              policies && !tagDefinition ? (
                <ProjectsEmpty
                  canCreateProjects={policies.get('projects').has('INSERT')}
                  onProjectCreated={onProjectCreated}
                  onError={onError}
                />
              ) : (
                <ProjectGroupEmpty />
              )
            ) : display === 'cards' ? (
              <ProjectsGrid
                me={me}
                projects={filteredProjects as ExtendedProjectData[]}
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
                me={me}
                projects={filteredProjects as ExtendedProjectData[]}
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
              onClose={() => setShowProfileNag(false)}
            />
          </div>
        </div>
      </div>

      <Toast content={error} onOpenChange={(open) => !open && setError(null)} />
      <Toast content={toast} onOpenChange={(open) => !open && setToast(null)} />
    </ToastProvider>
  );
};

export const ProjectsHomeApp = (props: ProjectsHomeProps) => (
  <I18nextProvider i18n={clientI18next}>
    <TagContextProvider scope='user' scopeId={props.me.id} targetType='project'>
      <ProjectsHome me={props.me} projects={props.projects} />
    </TagContextProvider>
  </I18nextProvider>
);
