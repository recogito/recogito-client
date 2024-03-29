import { DownloadSimple, Plus } from '@phosphor-icons/react';
import { DocumentCard } from '@components/DocumentCard';
import { UploadActions, UploadTracker, useDragAndDrop, useUpload } from '@apps/project-home/upload';
import { DocumentLibrary } from '@components/DocumentLibrary';
import type { DocumentInContext, Document, Protocol, ExtendedProjectData, Translations, MyProfile } from 'src/Types';
import { useState, useMemo } from 'react';
import type { FileRejection } from 'react-dropzone';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveLayer, setDocumentPrivacy } from '@backend/crud';
import { useDocumentList } from '@apps/project-home/useDocumentList';
import { validateIIIF } from '@apps/project-home/upload/dialogs/useIIIFValidation';
import type { ToastContent } from '@components/Toast';
import '../ProjectHome.css'

interface DocumentsViewProps {
  isAdmin: boolean;
  i18n: Translations;

  documents: DocumentInContext[];

  project: ExtendedProjectData;

  user: MyProfile;

  setToast(content: ToastContent): void;
}

export const DocumentsView = (props: DocumentsViewProps) => {

  const [addOpen, setAddOpen] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [documentUpdated, setDocumentUpdated] = useState(false);
  const [documents, setDocuments] = useState<DocumentInContext[]>(
    props.documents
  );

  const { addUploads, isIdle, uploads, dataDirty, clearDirtyFlag } = useUpload(
    (document) => setDocuments((d) => [...d, document])
  );

  const documentIds = useMemo(() => documents.map((d) => d.id), [documents]);

  const defaultContext = props.project.contexts.find((c) => c.is_project_default);

  const { addDocumentIds } = useDocumentList(
    props.project.id,
    defaultContext?.id,
    (document) => setDocuments((d) => [...d, document])
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
        validateIIIF(accepted, props.i18n).then(({ isValid, result, error }) => {
          if (isValid) {
            addUploads([
              {
                name: result?.label || accepted,
                projectId: props.project.id,
                contextId: defaultContext!.id,
                url: accepted,
                protocol: result?.type === 'image' ? 'IIIF_IMAGE' : 'IIIF_PRESENTATION'
              },
            ]);

            setShowUploads(true);
          } else {
            props.setToast({
              title: 'Error',
              description: error,
              type: 'error'
            })
          }
        });
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } =
    useDragAndDrop(onDrop);

  const onImportRemote = (protocol: Protocol, url: string, label?: string) => {
    setShowUploads(true);

    addUploads([
      {
        name: label || url,
        projectId: props.project.id,
        contextId: defaultContext!.id,
        url,
        protocol
      },
    ]);
  };

  /**
   * When 'deleting a document' we're actually just archiving
   * all the layers on this document in this project!
   */
  const onDeleteDocument = (document: DocumentInContext) => {
    // Optimistic update: remove document from the list
    setDocuments((documents) => documents.filter((d) => d.id !== document.id));
    setDocumentUpdated(true);

    // Note this will get easier when (if) we get a single RPC call
    // to archive a list of records
    const chained = document.layers.reduce(
      (p, nextLayer) => p.then(() => archiveLayer(supabase, nextLayer.id)),
      Promise.resolve()
    );

    chained
      .then(() => {
        props.setToast({
          title: t['Deleted'],
          description: t['Document deleted successfully.'],
          type: 'success',
        });
      })
      .catch(() => {
        // Roll back optimistic update in case of failure
        setDocuments((documents) => [...documents, document]);
        props.setToast({
          title: t['Something went wrong'],
          description: t['Could not delete the document.'],
          type: 'error',
        });
      });
  };

  const onTogglePrivate = (document: Document) => {
    setDocumentPrivacy(supabase, document.id, !document.is_private).then(() =>
      setDocumentUpdated(true)
    );
  };

  const onUpdateDocument = (document: Document) => {
    setDocuments((documents) =>
      documents.map((d) =>
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

  const onDocumentSelected = (_document: DocumentInContext) => { };

  const onDocumentsSelected = (documentIds: string[]) => {
    addDocumentIds(documentIds);
    setAddOpen(false);
  };

  return (
    <>
      <header className='project-home-document-header-bar'>
        <h1>
          {t['Documents']}
        </h1>
        {props.isAdmin && (
          <div className='admin-actions'>
            <button className='primary' onClick={onAddDocument}>
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

      <div
        className='project-home-grid-wrapper'
        {...(props.isAdmin ? getRootProps() : {})}
      >
        <div
          className='project-home-grid'
          style={isDragActive ? { pointerEvents: 'none' } : undefined}
        >
          {documents.map((document) => (
            <DocumentCard
              key={document.id}
              isDefaultContext
              isAdmin={props.isAdmin}
              i18n={props.i18n}
              document={document}
              context={defaultContext!}
              onDelete={() => onDeleteDocument(document)}
              onUpdate={onUpdateDocument}
              onError={onError}
            />
          ))}
        </div>
      </div>
      <div style={isDragActive ? { pointerEvents: 'none' } : undefined}>
        <DocumentLibrary
          open={addOpen}
          i18n={props.i18n}
          onAddDocument={onDocumentSelected}
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
          onDelete={onDeleteDocument}
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
  )
}