import { useState } from 'react';
import { CloudArrowUp } from '@phosphor-icons/react';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveLayer, renameDocument, updateProject } from '@backend/crud';
import { DocumentCard } from '@components/DocumentCard';
import { EditableText } from '@components/EditableText';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import { UploadActions, UploadFormat, UploadTracker, useUpload, useDragAndDrop } from './upload';
import type { DocumentInProject, ExtendedProjectData, Translations } from 'src/Types';
import type { FileRejection } from 'react-dropzone';

import './ProjectHome.css';

export interface ProjectHomeProps {

  i18n: Translations;

  project: ExtendedProjectData;

  documents: DocumentInProject[];

}

export const ProjectHome = (props: ProjectHomeProps) => {

  const { t } = props.i18n;

  const { project } = props;

  // Temporary hack!
  const defaultContext = project.contexts[0];

  const [documents, setDocuments] = useState<DocumentInProject[]>(props.documents);

  const [error, setError] = useState<ToastContent | null>(null);

  const [showUploads, setShowUploads] = useState(false);

  const { addUploads, isIdle, uploads } = useUpload(document => setDocuments([...documents, document]));

  const onDrop = (accepted: File[] | string, rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      setError({
        title: 'Sorry',
        description: 'Unsupported file format.',
        type: 'error'
      });
    } else {
      setShowUploads(true);

      if (Array.isArray(accepted)) {
        addUploads(accepted.map(file => ({
          name: file.name,
          projectId: project.id,
          contextId: defaultContext.id,
          file
        })));
      } else if (typeof accepted === 'string') {
        addUploads([{
          name: accepted, // TODO find a better solution
          projectId: project.id,
          contextId: defaultContext.id,
          url: accepted
        }]);
      }
    }
  }

  const { 
    getRootProps, 
    getInputProps, 
    isDragActive,
    open
  } = useDragAndDrop(onDrop);

  const onImportRemote = (format: UploadFormat, url: string) => {
    setShowUploads(true);

    addUploads([{
      name: url, // TODO find a better solution
      projectId: project.id,
      contextId: defaultContext.id,
      url
    }]);
  }

  const onRenameProject = (name: string) => {
    updateProject(supabase, {
      ...props.project, name
    }).then(response => {
      console.log(response);
    });
  }

  /**
   * When 'deleting a document' we're actually just archiving
   * all the layers on this document in this project!
   */
  const onDeleteDocument = (document: DocumentInProject) => {
    // Note this will get easier when (if) we get a single RPC call
    // to archive a list of records
    document.layers.reduce((p, nextLayer) => 
      p.then(() => archiveLayer(supabase, nextLayer.id)
    ), Promise.resolve());
  }

  const onRenameDocument = (document: DocumentInProject, name: string) => {
    // Optimistic update
    setDocuments(documents.map(d => d.id === document.id ? ({
      ...d, name
    }) : d));

    // Update on server
    renameDocument(supabase, document.id, name)
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
          {...getRootProps()}>

          <div className="project-home-grid" style={isDragActive ? { pointerEvents: 'none'} : undefined}>
            {documents.map(document => (
              <DocumentCard
                key={document.id}
                i18n={props.i18n} 
                document={document} 
                context={defaultContext}
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