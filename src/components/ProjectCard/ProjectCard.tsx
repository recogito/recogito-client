import { Article, GraduationCap, Image } from '@phosphor-icons/react';
import { useProjectPolicies } from '@backend/hooks';
import { joinProject } from '@backend/helpers';
import { Avatar } from '@components/Avatar';
import type {
  ContentType,
  ExtendedProjectData,
  MyProfile,
  Policies,
  Translations,
  UserProfile,
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

  onDetailsChanged(updated: ExtendedProjectData): void;

  onError(error: string): void;
}

export const ProjectCard = (props: ProjectCardProps) => {
  const { contexts, description, layers, id, groups, name, is_open_join } =
    props.project;

  const policies = useProjectPolicies(props.project.id);

  const [joinProjectOpen, setJoinProjectOpen] = useState(false);

  const members = groups
    .reduce(
      (members, group) => [...members, ...group.members],
      [] as Array<{ user: UserProfile; since: string }>
    )
    .reverse();

  // TODO needs more robustness for new content types
  // in the future
  const documents = layers.reduce((documents, layer) => {
    if (documents.some((d) => d.id === layer.document?.id))
      return [...documents];
    else if (layer.document) return [...documents, layer.document];
    else return documents;
  }, [] as { id: string; content_type?: ContentType }[]);

  const images = documents.filter(({ content_type }) => !content_type);

  const texts = documents.filter(({ content_type }) => content_type);

  const onClick = () => {
    if (!is_open_join || members.length > 0) {
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
          {contexts.length > 1 && (
            <li>
              <GraduationCap size={16} />
              <span className='count'>{contexts.length - 1}</span>
            </li>
          )}

          {images.length > 0 && (
            <li>
              <Image size={16} />
              <span className='count'>{images.length}</span>
            </li>
          )}

          {texts.length > 0 && (
            <li>
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
          {members.slice(0, 5).map(({ user }) => (
            <Avatar
              key={user.id}
              id={user.id}
              name={
                user.nickname
                  ? user.nickname
                  : [user.first_name, user.last_name]
                      .filter((str) => str)
                      .join(' ')
                      .trim()
              }
              avatar={user.avatar_url}
            />
          ))}
        </div>

        {policies?.get('projects').has('UPDATE') && (
          <ProjectCardActions
            i18n={props.i18n}
            me={props.me}
            project={props.project}
            onDeleted={props.onDeleted}
            onDetailsChanged={props.onDetailsChanged}
            onError={props.onError}
            orgPolicies={props.orgPolicies}
          />
        )}
        {is_open_join && members.length === 0 && (
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
