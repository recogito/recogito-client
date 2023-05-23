import { Plus } from '@phosphor-icons/react';
import type { Project, Translations } from 'src/Types';

export interface ProjectHomeProps {

  i18n: Translations;

  project: Project;

}

export const ProjectHome = (props: ProjectHomeProps) => {

  const { i18n, project } = props;

  const onAddDummyContent = () => {
    
  }

  return (
    <div className="project-home">
      <h1>{project.name}</h1>
      <button className="primary" onClick={onAddDummyContent}>
        <Plus size={20} /> Add Dummy Content
      </button>
    </div>
  )

}