import { Plus } from '@phosphor-icons/react';
import type { Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createDocument } from '@backend/documents';

export interface ProjectHomeProps {

  i18n: Translations;

  project: Project;

}

export const ProjectHome = (props: ProjectHomeProps) => {

  const { i18n, project } = props;

  const onAddDummyContent = () => {
    console.log('Inserting dummy documents');
    createDocument(supabase, 'dummy-text-document');
    createDocument(supabase, 'dummy-image-document');
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