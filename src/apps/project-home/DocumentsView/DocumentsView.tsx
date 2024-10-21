import { DownloadSimple, Plus } from '@phosphor-icons/react';
import { DocumentCard } from '@components/DocumentCard';
import {
  UploadActions,
  UploadTracker,
  useDragAndDrop,
  useUpload,
} from '@apps/project-home/upload';
import { DocumentLibrary } from '@components/DocumentLibrary';
import type {
  Document,
  Protocol,
  ExtendedProjectData,
  Translations,
  MyProfile,
} from 'src/Types';
import { useState, useMemo } from 'react';
import type { FileRejection } from 'react-dropzone';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveDocument, setDocumentPrivacy } from '@backend/crud';
import { useDocumentList } from '@apps/project-home/useDocumentList';
import { validateIIIF } from '@apps/project-home/upload/dialogs/useIIIFValidation';
import type { ToastContent } from '@components/Toast';
import { removeDocumentsFromProject } from '@backend/helpers';

import '../ProjectHome.css';

interface DocumentsViewProps {
  isAdmin: boolean;
  i18n: Translations;

  documents: Document[];

  project: ExtendedProjectData;

  user: MyProfile;

  setToast(content: ToastContent): void;

  setDocuments(documents: Document[]): void;

  onRemoveDocument(document: Document): void;
}

export const DocumentsView = (props: DocumentsViewProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [documentUpdated, setDocumentUpdated] = useState(false);

  const { addUploads, isIdle, uploads, dataDirty, clearDirtyFlag } = useUpload(
    (documents) => props.setDocuments([...props.documents, ...documents])
  );

  const documentIds = useMemo(
    () => props.documents.map((d) => d.id),
    [props.documents]
  );

  const defaultContext = props.project.contexts.find(
    (c) => c.is_project_default
  );

  const { addDocumentIds } = useDocumentList(
    props.project.id,
    defaultContext?.id,
    (documents) => props.setDocuments([...props.documents, ...documents])
  );

  const { t, lang } = props.i18n;

  const onDrop = (accepted: File[] | string, rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      props.setToast({
        title: 'Sorry',
        description: 'Unsupported file format.',
        type: 'error',
      });
    } else {
      if (Array.isArray(accepted)) {
        addUploads(
          accepted.map((file) => ({
            name: file.name,
            projectId: props.project.id,
            contextId: defaultContext!.id,
            file,
          }))
        );

        setShowUploads(true);
      } else if (typeof accepted === 'string') {
        validateIIIF(accepted, props.i18n).then(
          ({ isValid, result, error }) => {
            if (isValid) {
              addUploads([
                {
                  name: result?.label || accepted,
                  projectId: props.project.id,
                  contextId: defaultContext!.id,
                  url: accepted,
                  protocol:
                    result?.type === 'image'
                      ? 'IIIF_IMAGE'
                      : 'IIIF_PRESENTATION',
                },
              ]);

              setShowUploads(true);
            } else {
              props.setToast({
                title: 'Error',
                description: error,
                type: 'error',
              });
            }
          }
        );
      }
    }
  };

  const { getInputProps, open } = useDragAndDrop(onDrop);

  const onImportRemote = (protocol: Protocol, url: string, label?: string) => {
    setShowUploads(true);

    addUploads([
      {
        name: label || url,
        projectId: props.project.id,
        contextId: defaultContext!.id,
        url,
        protocol,
      },
    ]);
  };

  /**
   * When 'deleting a document' we're actually just archiving
   * all the layers on this document in this project!
   */
  const onDeleteDocument = (document: Document) => {
    // Optimistic update: remove document from the list
    props.setDocuments(props.documents.filter((d) => d.id !== document.id));
    setDocumentUpdated(true);
    removeDocumentsFromProject(supabase, props.project.id, [document.id]).then(
      (resp) => {
        if (resp) {
          props.onRemoveDocument(document);
          props.setToast({
            title: t['Deleted'],
            description: t['Document deleted successfully.'],
            type: 'success',
          });
        } else {
          // Roll back optimistic update in case of failure
          props.setDocuments([...props.documents, document]);
          props.setToast({
            title: t['Something went wrong'],
            description: t['Could not delete the document.'],
            type: 'error',
          });
        }
      }
    );
  };

  // This actually archives the document
  const onDeleteDocumentFromLibrary = (document: Document) => {
    archiveDocument(supabase, document.id).then(({ data }) => {
      if (data) {
        props.setToast({
          title: t['Deleted'],
          description: t['Document deleted successfully.'],
          type: 'success',
        });

        setDocumentUpdated(true);
      } else {
        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the document.'],
          type: 'error',
        });
      }
    });
  };

  const onTogglePrivate = (document: Document) => {
    setDocumentPrivacy(supabase, document.id, !document.is_private).then(() =>
      setDocumentUpdated(true)
    );
  };

  const onUpdateDocument = (document: Document) => {
    props.setDocuments(
      props.documents.map((d) =>
        d.id === document.id
          ? {
              ...d,
              ...document,
            }
          : d
      )
    );

    setDocumentUpdated(true);
  };

  const onError = (error: string) => {
    props.setToast({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  const onAddDocument = () => {
    setAddOpen(true);
  };

  const onDocumentsSelected = (documentIds: string[]) => {
    addDocumentIds(documentIds);
    setAddOpen(false);
  };

  return (
    <>
      <header className='project-home-document-header-bar'>
        <h2>{t['Documents']}</h2>
        {props.isAdmin && (
          <div className='admin-actions'>
            <button
              className='button primary project-home-add-document'
              onClick={onAddDocument}
            >
              <Plus size={20} /> <span>{t['Add Document']}</span>
            </button>
            <a
              href={`/${lang}/projects/${props.project.id}/export/csv`}
              className='button'
            >
              <DownloadSimple size={20} />
              <span>{t['Export annotations as CSV']}</span>
            </a>
          </div>
        )}
      </header>

      <div className='project-home-grid-wrapper'>
        <div className='project-home-grid'>
          {props.documents.map((document) => (
            <DocumentCard
              key={document.id}
              isAdmin={props.isAdmin}
              i18n={props.i18n}
              document={document}
              context={defaultContext!}
              onDelete={() => onDeleteDocument(document)}
              onUpdate={onUpdateDocument}
              onError={onError}
              rtab={props.project.document_view_right}
            />
          ))}
        </div>
      </div>
      <div>
        <DocumentLibrary
          open={addOpen}
          i18n={props.i18n}
          onCancel={() => setAddOpen(false)}
          user={props.user}
          dataDirty={dataDirty || documentUpdated}
          clearDirtyFlag={() => {
            clearDirtyFlag();
            setDocumentUpdated(false);
          }}
          UploadActions={
            <UploadActions
              i18n={props.i18n}
              onUpload={open}
              onImport={onImportRemote}
            />
          }
          onDocumentsSelected={onDocumentsSelected}
          disabledIds={documentIds}
          onUpdated={onUpdateDocument}
          onError={onError}
          onDeleteFromLibrary={onDeleteDocumentFromLibrary}
          onTogglePrivate={onTogglePrivate}
          isAdmin={props.isAdmin}
        />
      </div>
      <UploadTracker
        i18n={props.i18n}
        show={showUploads}
        closable={isIdle}
        uploads={uploads}
        onClose={() => setShowUploads(false)}
      />
      <input {...getInputProps()} />
    </>
  );
};
