import { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUp } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateDocument, updateProject } from '@backend/crud';
import { initDocument } from '@backend/helpers';
import { DocumentCard } from '@components/DocumentCard';
import { EditableText } from '@components/EditableText';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { ImportDocumentActions, ImportFormat } from './ImportDocumentActions';
import { UploadProgress } from './UploadProgress';
import type { Context, Document, Project, Translations } from 'src/Types';

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

  const [uploading, setUploading] = useState<string | null>(null);

  const [error, setError] = useState<ToastContent | null>(null);

  const onDrop = (files: File[]) => {
    // TODO for now, throw error if multiple files!
    const f = files[0];

    setUploading(f.name);

    initDocument(supabase, f.name, project.id, defaultContext.id, f)
      .then(({ document, defaultLayer }) => {
        setDocuments([...documents, document]);
        setUploading(null);
      })
      .catch(error => {
        console.error(error);
        setUploading(null);
        setError({ 
          title: t['Something went wrong'], 
          description: t['Could not create the document.'], 
          type: 'error' 
        });
      })
  }

  // Call open to open the file dialog
  const { getRootProps, getInputProps, open, isDragActive } = useDropzone({ onDrop, noClick: true });

  const onImportRemote = (format: ImportFormat) => {
    setError({
      title: 'Sorry',
      description: 'Not supported yet',
      type: 'info'
    });
  }

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
    <div className="project-home">
      <ToastProvider>
        <div>
          <h1>
            <EditableText 
              value={project.name} 
              onSubmit={onRenameProject} />
          </h1>
          
          <ImportDocumentActions 
            i18n={props.i18n} 
            onUpload={open}
            onImport={onImportRemote} />
        </div>

        <div className="project-home-grid-wrapper" {...getRootProps()}>
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

          {isDragActive && (
            <div className="dropzone-hint-wrapper">
              <div className="dropzone-hint">
                <div className="dropzone-hint-popup">
                  <CloudArrowUp size={32} />
                  <h1>Drop files or links to IIIF manifests to add them to your project.</h1>
                  <p>
                    Supported file formats: plaint text (UTF-8)
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <UploadProgress 
          open={Boolean(uploading)}
          filename={uploading || ''}
          progress={10} />

        <Toast
          content={error}
          onOpenChange={open => !open && setError(null)} />
      </ToastProvider>

      <input {...getInputProps()} />
    </div>
  )

}