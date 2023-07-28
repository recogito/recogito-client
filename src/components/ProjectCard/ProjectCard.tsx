import { Article, Image } from '@phosphor-icons/react';
import { Avatar } from '@components/Avatar';
import type { ContentType, ExtendedProjectData, Translations, UserProfile } from 'src/Types';
import { ProjectCardActions } from './ProjectCardActions';

import './ProjectCard.css';

interface ProjectCardProps {

  i18n: Translations;

  project: ExtendedProjectData;

  onDelete(): void;

  onRename(): void;

}

export const ProjectCard = (props: ProjectCardProps) => {

  const { layers, id, groups, name } = props.project;

  const members = groups.reduce((members, group) => (
    [...members, ...group.members]
  ), [] as Array<{ user: UserProfile, since: string }>);

  // TODO needs more robustness for new content types 
  // in the future
  const documents = layers.reduce((documents, layer) => {
    if (documents.some(d => d.id === layer.document.id))
      return [...documents];
    else
      return [...documents, layer.document];
  }, [] as {id: string, content_type?: ContentType }[]);

  const images = documents.filter(({ content_type }) => !content_type);

  const texts = documents.filter(({ content_type }) => content_type);

  const onClick = () =>
    window.location.href = `./projects/${id}`;

  return (
    <div className="project-card">
      <div className="project-card-body" onClick={onClick}>
        <h1><a href={`/${props.i18n.lang}/projects/${id}`}>{name}</a></h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint 
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
        <ul className="document-stats">
          {images.length > 0 && (
            <li>
              <Image size={16} />
              <span className="count">{images.length}</span>
            </li>
          )}

          {texts.length > 0 && (
            <li>
              <Article size={16} />
              <span className="count">{texts.length}</span>
            </li>
          )}
        </ul>
      </div>

      <div className="project-card-footer">
        <div className="avatar-stack">
          {members.slice(0, 5).map(({ user }) => (
            <Avatar
              id={user.id}
              name={user.nickname ? 
                  user.nickname : 
                  [user.first_name, user.last_name]
                    .filter(str => str).join(' ').trim()}
              avatar={user.avatar_url} />
          ))}
        </div>
        <ProjectCardActions
          i18n={props.i18n}
          onDelete={props.onDelete} 
          onRename={props.onRename}/>
      </div>
    </div>
  )

}