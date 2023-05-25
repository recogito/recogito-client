import { Plus } from '@phosphor-icons/react';
import type { Document, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { createDocument } from '@backend/documents';
import { DocumentCard } from '@components/DocumentCard';

/**
 * Just a hack for testing
 */
const DOCUMENTS: Document[] = [{
  id: '85aa0e08-845f-4b9b-967d-25022cea27c4',
  created_at: (new Date()).toISOString(),
  created_by: '096fb42d-085f-480e-81db-6b66309ed5e8',
  name: 'Sample Text File'
}, {
  id: 'c6eed3fa-b2b6-48e2-8321-32bac364c1dd',
  created_at: (new Date()).toISOString(),
  created_by: '096fb42d-085f-480e-81db-6b66309ed5e8',
  name: 'Sample Image File'
}];

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

  const onDeleteDocument = (document: Document) => {
    // TODO
  }

  return (
    <div className="project-home">
      <h1>{project.name}</h1>
      <button className="primary" onClick={onAddDummyContent}>
        <Plus size={20} /> Add Dummy Content
      </button>

      <div className="project-home-grid">
        {DOCUMENTS.map(document => (
          <DocumentCard 
            i18n={i18n} 
            document={document} 
            onDelete={() => onDeleteDocument(document)} />
        ))}
      </div>
    </div>
  )

}