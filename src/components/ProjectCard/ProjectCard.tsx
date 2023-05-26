import type { Project, Translations } from 'src/Types';
import { ProjectCardActionsMenu } from './ProjectCardActionsMenu';

import './ProjectCard.css';

interface ProjectCardProps {

  i18n: Translations;

  project: Project;

  onDelete(): void;

  onRename(): void;

}

export const ProjectCard = (props: ProjectCardProps) => {

  const { id, name } = props.project;

  const onClick = () =>
    window.location.href = `./projects/${id}`;

  return (
    <div className="project-card">
      <div onClick={onClick}>
        <h1><a href={`./projects/${id}`}>{name}</a></h1>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt 
          ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation 
          ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in 
          reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint 
          occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
        </p>
      </div>
 
      <ProjectCardActionsMenu
        i18n={props.i18n}
        onDelete={props.onDelete} 
        onRename={props.onRename}/>
    </div>
  )

}