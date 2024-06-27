import { useState } from 'react';
import { joinProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Avatar } from '@components/Avatar';
import { OwnerPill } from '@components/OwnerPill';
import { ProjectCardActions } from '@components/ProjectCard/ProjectCardActions';
import { JoinProjectDialog } from '@components/ProjectCard/JoinProjectDialog';
import { OpenJoin } from '@components/ProjectCard/OpenJoin';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
  Translations,
} from 'src/Types';

import './ProjectEntry.css';

interface ProjectsEntryProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  orgPolicies: Policies | undefined;

  onDeleted(): void;

  onLeaveProject(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;
}

export const ProjectsEntry = (props: ProjectsEntryProps) => {
  const {
    contexts,
    description,
    id,
    users,
    name,
    is_open_join,
    documents,
    created_by,
  } = props.project;

  const [joinProjectOpen, setJoinProjectOpen] = useState(false);

  const images = documents.filter(({ content_type }) => !content_type);

  const texts = documents.filter(({ content_type }) => content_type);

  const showDocs = props.orgPolicies
    ? props.orgPolicies.get('projects').has('INSERT')
    : false;

  const onClick = () => {
    if (!is_open_join || users.length > 0) {
      window.location.href = `./projects/${id}`;
    }
  };

  const handleJoinProject = () => {
    setJoinProjectOpen(true);
  };

  const handleConfirmJoin = () => {
    setJoinProjectOpen(false);
    joinProject(supabase, id).then((resp) => {
      if (resp) {
        window.location.href = `./projects/${id}`;
      } else {
        props.onError(props.i18n.t['Something happened']);
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
          <p className='no-description'>{props.i18n.t['No description.']}</p>
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
        {created_by.id === props.me.id && <OwnerPill i18n={props.i18n} />}
        {users.length > 0 && (
          <ProjectCardActions
            i18n={props.i18n}
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
            i18n={props.i18n}
            onJoin={handleJoinProject}
          />
        )}
      </div>
      <JoinProjectDialog
        open={joinProjectOpen}
        onClose={() => setJoinProjectOpen(false)}
        i18n={props.i18n}
        project={props.project}
        onJoin={handleConfirmJoin}
      />
    </div>
  );
};
