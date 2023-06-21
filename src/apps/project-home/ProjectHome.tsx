import { useState } from 'react';
import { CloudArrowUp } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { useDropzone } from 'react-dropzone';
import { updateDocument, updateProject } from '@backend/crud';
import { DocumentCard } from '@components/DocumentCard';
import { EditableText } from '@components/EditableText';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { UploadActions, UploadFormat, UploadTracker, useUpload } from './upload';
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

  const [error, setError] = useState<ToastContent | null>(null);

  const [showUploads, setShowUploads] = useState(false);

  const { addUploads, isIdle, uploads } = useUpload(document => setDocuments([...documents, document]));

  const [isDragActive, setIsDragActive] = useState(false);

  const onDropFiles = (files: File[]) => {
    console.log('drop', files);

    /*
    setShowUploads(true);

    addUploads(files.map(file => ({
      name: file.name,
      projectId: project.id,
      contextId: defaultContext.id,
      file
    })));
    */
  }

  const { 
    getRootProps, 
    getInputProps, 
    open,
    rootRef
  } = useDropzone({ onDrop: onDropFiles, noClick: true, noKeyboard: true });

  const onDragOver = (evt: React.DragEvent) => { 
    evt.preventDefault();

    if (!isDragActive)
      setIsDragActive(true);
  }

  const onDragLeave = (evt: React.DragEvent<HTMLDivElement>) => {
    evt.preventDefault();

    if (evt.target == rootRef.current)
      setIsDragActive(false);
  }

  const onDrop = (evt: React.DragEvent) => {
    evt.preventDefault();

    setIsDragActive(false);
  }

  const onImportRemote = (format: UploadFormat) => {
    setShowUploads(true);

    setError({
      title: 'Sorry',
      description: 'Not supported yet',
      type: 'info'
    });
  }

  /*
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
  */

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
          
          <UploadActions 
            i18n={props.i18n} 
            onUpload={open}
            onImport={onImportRemote} />
        </div>

        <div 
          className="project-home-grid-wrapper"
          {...getRootProps({
            onDragOver,
            onDragLeave,
            onDrop
          })}>

          <div className="project-home-grid" style={isDragActive ? { pointerEvents: 'none'} : undefined}>
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

        <UploadTracker 
          show={showUploads}
          closable={isIdle}
          uploads={uploads} 
          onClose={() => setShowUploads(false)} />

        <Toast
          content={error}
          onOpenChange={open => !open && setError(null)} />
      </ToastProvider>

      <input {...getInputProps() } />
    </div>
  )

}