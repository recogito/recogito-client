import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import type { Context, Document, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateProject } from '@backend/crud';
import { initDocument } from '@backend/helpers';
import { DocumentCard } from '@components/DocumentCard';
import { EditableText } from '@components/EditableText';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';

import './ProjectHome.css';

export interface ProjectHomeProps {

  i18n: Translations;

  project: Project;

  defaultContext: Context;

  documents: Document[];

}

export const ProjectHome = (props: ProjectHomeProps) => {

  const { t } = props.i18n;

  const { project, defaultContext } = props;

  const [documents, setDocuments] = useState<Document[]>(props.documents);

  const [error, setError] = useState<ToastContent | null>(null);

  const onAddDummyImage = () => {
    initDocument(supabase, 'dummy-document', defaultContext.id)
      .then(({ document }) => {
        setDocuments([...documents, document]);
      })
      .catch(error => {
        console.error(error);
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the document.'], 
          severity: 'error' 
        });
      });
  }

  const onRenameProject = (name: string) => {
    updateProject(supabase, {
      ...props.project, name
    }).then(response => {
      console.log(response);
    });
  }

  const onDeleteDocument = (document: Document) => {
    // TODO
  }

  return (
    <div className="project-home">
      <ToastProvider>
        <h1>
          <EditableText 
            value={project.name} 
            onSubmit={onRenameProject} />
        </h1>
        <button className="primary" onClick={onAddDummyImage}>
          <Plus size={20} /> <span>Add Dummy Content</span>
        </button>

        <div className="project-home-grid">
          {documents.map(document => (
            <DocumentCard 
              key={document.id}
              i18n={props.i18n} 
              context={defaultContext}
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