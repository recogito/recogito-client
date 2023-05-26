import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import type { Context, Document, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { initDocument } from '@backend/helpers';
import { DocumentCard } from '@components/DocumentCard';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';

import './ProjectHome.css';

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

  defaultContext: Context;

}

export const ProjectHome = (props: ProjectHomeProps) => {

  const { project, defaultContext } = props;

  const { t } = props.i18n;

  const [error, setError] = useState<ToastContent | null>(null);

  const onAddDummyContent = () =>
    initDocument(supabase, 'dummy-document', defaultContext.id)
      .then(({ document }) => {
        console.log('Created document', document);
      })
      .catch(error => {
        console.log(error);
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the document.'], 
          severity: 'error' 
        });
      });

  const onDeleteDocument = (document: Document) => {
    // TODO
  }

  return (
    <div className="project-home">
      <ToastProvider>
        <h1>{project.name}</h1>
        <button className="primary" onClick={onAddDummyContent}>
          <Plus size={20} /> <span>Add Dummy Content</span>
        </button>

        <div className="project-home-grid">
          {DOCUMENTS.map(document => (
            <DocumentCard 
              key={document.id}
              i18n={props.i18n} 
              document={document} 
              onDelete={() => onDeleteDocument(document)} />
          ))}
        </div>

        <Toast
          content={error}
          onOpenChange={open => !open && setError(null)} />
      </ToastProvider>
    </div>
  )

}