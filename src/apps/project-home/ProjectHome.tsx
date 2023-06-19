import { useState } from 'react';
import { Plus } from '@phosphor-icons/react';
import { useDropzone } from 'react-dropzone';
import type { Context, Document, Project, Translations } from 'src/Types';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateDocument, updateProject } from '@backend/crud';
import { initDocument } from '@backend/helpers';
import { DocumentCard } from '@components/DocumentCard';
import { EditableText } from '@components/EditableText';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { useUpload } from './useUpload';

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

  const onDrop = useUpload(project, defaultContext, document => {
    console.log('yay', document);
    setDocuments([...documents, document]);
  }, error => {
    console.error(error);
    setError({ 
      title: t['Something went wrong'], 
      description: t['Could not create the document.'], 
      type: 'error' 
    });
  });

  // Call open to open the file dialog
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop, noClick: true })

  const onAddDummyImage = () => {
    initDocument(supabase, 'dummy-document', project.id, defaultContext.id)
      .then(({ document }) => {
        setDocuments([...documents, document]);
      })
      .catch(error => {
        console.error(error);
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the document.'], 
          type: 'error' 
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

  const onRenameDocument = (document: Document, name: string) => {
    // Optimistic update
    setDocuments(documents.map(d => d.id === document.id ? ({
      ...d, name
    }) : d));

    // Update on server
    updateDocument(supabase, { ...document, name })
      .then(({ error, data }) => {
        if (error || !data) {
          // Show error and roll back name change
          setError({ 
            title: t['Something went wrong'], 
            description: t['Could not rename the document.'], 
            type: 'error' 
          });

          setDocuments(documents.map(d => d.id === document.id ? ({
            ...d, name: document.name
          }) : d));
        }
      });
  }

  return (
    <div className="project-home" {...getRootProps()}>
      <ToastProvider>
        <h1>
          <EditableText 
            value={project.name} 
            onSubmit={onRenameProject} />
        </h1>
        <button className="primary" onClick={onAddDummyImage}>
          <Plus size={20} /> <span>{t['Import Document']}</span>
        </button>

        <div className="project-home-grid">
          {documents.map(document => (
            <DocumentCard 
              // just a hack for now
              isImage={document.name.toLowerCase().includes('image')}
              key={document.id}
              i18n={props.i18n} 
              context={defaultContext}
              document={document} 
              onDelete={() => onDeleteDocument(document)} 
              onRename={name => onRenameDocument(document, name)} />
          ))}
        </div>

        <Toast
          content={error}
          onOpenChange={open => !open && setError(null)} />
      </ToastProvider>

      <input {...getInputProps()} />
          
      {isDragActive && (
        <div className="project-home-filedrop">
          <h1>Drop Files Here</h1>
        </div>
      )}
    </div>
  )

}