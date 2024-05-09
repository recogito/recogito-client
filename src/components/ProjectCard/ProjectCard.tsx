import {
  Article,
  GraduationCap,
  Image,
  LineVertical,
} from '@phosphor-icons/react';
import { joinProject } from '@backend/helpers';
import { Avatar } from '@components/Avatar';
import type {
  ExtendedProjectData,
  MyProfile,
  Policies,
  Translations,
} from 'src/Types';
import { ProjectCardActions } from './ProjectCardActions';
import { OpenJoin } from './OpenJoin';

import './ProjectCard.css';
import { JoinProjectDialog } from './JoinProjectDialog';
import { useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';

interface ProjectCardProps {
  i18n: Translations;

  me: MyProfile;

  project: ExtendedProjectData;

  orgPolicies: Policies | undefined;

  onDeleted(): void;

  onLeaveProject(): void;

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;
}

export const ProjectCard = (props: ProjectCardProps) => {
  const { contexts, description, id, users, name, is_open_join, documents } =
    props.project;

  const [joinProjectOpen, setJoinProjectOpen] = useState(false);

  const images = documents.filter(({ content_type }) => !content_type);

  const texts = documents.filter(({ content_type }) => content_type);

  const { t } = props.i18n;

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
    <div className='project-card'>
      <div className='project-card-body' onClick={onClick}>
        <h1>
          <a href={`/${props.i18n.lang}/projects/${id}`}>{name}</a>
        </h1>
        {description ? (
          <p>{description}</p>
        ) : (
          <p className='no-description'>{props.i18n.t['No description.']}</p>
        )}
        <ul className='document-stats'>
          {contexts.length > 0 && (
            <li>
              <GraduationCap size={16} />
              <span className='count'>{contexts.length}</span>
              {!showDocs &&
                (contexts.length === 1
                  ? ` ${t['assignment']}`
                  : ` ${t['assignments']}`)}
            </li>
          )}

          {showDocs && images.length > 0 && (
            <li>
              <LineVertical size={16} />
              <Image size={16} />
              <span className='count'>{images.length}</span>
            </li>
          )}

          {showDocs && texts.length > 0 && (
            <li>
              <LineVertical size={16} />
              <Article size={16} />
              <span className='count'>{texts.length}</span>
            </li>
          )}
        </ul>
      </div>
      <JoinProjectDialog
        open={joinProjectOpen}
        onClose={() => setJoinProjectOpen(false)}
        i18n={props.i18n}
        project={props.project}
        onJoin={handleConfirmJoin}
      />
      <div className='project-card-footer'>
        <div className='avatar-stack'>
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
    </div>
  );
};
