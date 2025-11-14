import { useState } from 'react';
import { joinProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Avatar } from '@components/Avatar';
import { LockedPill } from '@components/LockedPill';
import { ProjectCardActions } from '@components/ProjectCard/ProjectCardActions';
import { JoinProjectDialog } from '@components/ProjectCard/JoinProjectDialog';
import { OpenJoin } from '@components/ProjectCard/OpenJoin';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
} from 'src/Types';
import { useTranslation } from 'react-i18next';

import './ProjectEntry.css';

interface ProjectsEntryProps {

  me: MyProfile;

  project: ExtendedProjectData;

  orgPolicies: Policies | undefined;

  onDeleted(): void;

  onLeaveProject(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;
}

export const ProjectsEntry = (props: ProjectsEntryProps) => {
  const { i18n, t } = useTranslation(['common', 'dashboard-projects']);

  const {
    contexts,
    description,
    id,
    users,
    name,
    is_open_join,
    documents,
    is_locked,
  } = props.project;

  const [joinProjectOpen, setJoinProjectOpen] = useState(false);

  const images = documents.filter(({ content_type }) => !content_type);

  const texts = documents.filter(({ content_type }) => content_type);

  const showDocs = props.orgPolicies
    ? props.orgPolicies.get('projects').has('INSERT')
    : false;

  const onClick = () => {
    if (!is_open_join || users.length > 0) {
      window.location.href = `/${i18n.language}/projects/${id}`;
    }
  };

  const handleJoinProject = () => {
    setJoinProjectOpen(true);
  };

  const handleConfirmJoin = () => {
    setJoinProjectOpen(false);
    joinProject(supabase, id).then((resp) => {
      if (resp) {
        window.location.pathname = `/${i18n.language}/projects/${id}`;
      } else {
        props.onError(t('Something went wrong', { ns: 'common' }));
      }
    });
  };

  return (
    <div className='project-entry'>
      <div className='project-entry-name' onClick={onClick}>
        <div className='text-body-bold'>{name}</div>
      </div>
      <div className='project-entry-description'>
        {description ? (
          <div className='project-entry-description-entry text-body-small'>
            {description}
          </div>
        ) : (
          <p className='no-description'>{t('No description.', { ns: 'dashboard-projects' })}</p>
        )}
      </div>

      <div
        className={
          showDocs
            ? 'project-entry-assignments-with-docs'
            : 'project-entry-assignments'
        }
      >
        <span className='count'>{contexts.length}</span>
      </div>

      {showDocs && (
        <div className='project-entry-texts'>
          <span className='count'>{images.length}</span>
        </div>
      )}

      {showDocs && (
        <div className='project-entry-images'>
          <span className='count'>{texts.length}</span>
        </div>
      )}
      <div className='project-entry-avatar-stack'>
        {users.map((member) => (
          <Avatar
            key={member.user.id}
            id={member.user.id}
            name={
              member.user.nickname
                ? member.user.nickname
                : [member.user.first_name, member.user.last_name]
                    .filter((str) => str)
                    .join(' ')
                    .trim()
            }
            avatar={member.user.avatar_url}
          />
        ))}
      </div>
      <div className='project-entry-actions'>
        {is_locked && <LockedPill />}
        {users.length > 0 && (
          <ProjectCardActions
            me={props.me}
            project={props.project}
            onDeleted={props.onDeleted}
            onLeaveProject={props.onLeaveProject}
            onDetailsChanged={props.onDetailsChanged}
            onError={props.onError}
            orgPolicies={props.orgPolicies}
          />
        )}
        {is_open_join && users.length === 0 && (
          <OpenJoin
            projectId={id}
            onJoin={handleJoinProject}
          />
        )}
      </div>
      <JoinProjectDialog
        open={joinProjectOpen}
        onClose={() => setJoinProjectOpen(false)}
        project={props.project}
        onJoin={handleConfirmJoin}
      />
    </div>
  );
};
