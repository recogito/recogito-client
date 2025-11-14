import {
  closestCenter,
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { DownloadSimple, Plus } from '@phosphor-icons/react';
import { DocumentCard } from '@components/DocumentCard';
import {
  UploadActions,
  UploadTracker,
  useDragAndDrop,
  useUpload,
} from '@apps/project-home/upload';
import { DocumentLibrary } from '@components/DocumentLibrary';
import classNames from 'classnames';
import type {
  Document,
  Protocol,
  ExtendedProjectData,
  MyProfile,
} from 'src/Types';
import { useState, useMemo, useCallback } from 'react';
import type { FileRejection } from 'react-dropzone';
import { supabase } from '@backend/supabaseBrowserClient';
import { archiveDocument, setDocumentPrivacy } from '@backend/crud';
import { useDocumentList } from '@apps/project-home/useDocumentList';
import { validateIIIF } from '@apps/project-home/upload/dialogs/useIIIFValidation';
import type { ToastContent } from '@components/Toast';
import {
  removeDocumentsFromProject,
  updateDocumentsSort,
} from '@backend/helpers';
import { useTranslation } from 'react-i18next';

import '../ProjectHome.css';

interface DocumentsViewProps {
  isAdmin: boolean;

  documents: Document[];

  project: ExtendedProjectData;

  user: MyProfile;

  setToast(content: ToastContent): void;

  setDocuments(documents: Document[]): void;

  onRemoveDocument(document: Document): void;

  onSetUser(user: MyProfile): void;
}

export const DocumentsView = (props: DocumentsViewProps) => {
  const [addOpen, setAddOpen] = useState(false);
  const [showUploads, setShowUploads] = useState(false);
  const [documentUpdated, setDocumentUpdated] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  const onDragStart = useCallback(
    (event: any) => setActiveId(event.active.id),
    []
  );

  const onDragEnd = useCallback(
    (event: any) => {
      const { active, over } = event;

      if (active.id !== over?.id) {
        const oldIndex = props.documents.findIndex(
          (document) => document.id === active.id
        );
        const newIndex = props.documents.findIndex(
          (document) => document.id === over!.id
        );

        const newDocuments = arrayMove(props.documents, oldIndex, newIndex);
        props.setDocuments(newDocuments);

        const newDocumentIds = newDocuments.map((document) => document.id);

        updateDocumentsSort(supabase, props.project.id, newDocumentIds).then(
          ({ error }) => {
            if (error) {
              console.log(error);
            }
          }
        );
      }

      setActiveId(null);
    },
    [props.documents, props.project]
  );

  const onDragCancel = useCallback(() => setActiveId(null), []);

  const activeDocument = useMemo(
    () => props.documents?.find((document) => document.id === activeId),
    [activeId]
  );

  const { addUploads, isIdle, uploads, dataDirty, clearDirtyFlag } = useUpload(
    (documents) =>
      props.setDocuments(
        [...props.documents, ...documents].reduce<Document[]>(
          (all, document) =>
            all.some((d) => d.id === document.id) ? all : [...all, document],
          []
        )
      )
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

  const { t, i18n } = useTranslation(['common', 'project-home', 'project-sidebar', 'a11y']);

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
            isPrivate: true,
          }))
        );

        setShowUploads(true);
      } else if (typeof accepted === 'string') {
        validateIIIF(accepted, i18n.language).then(
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
                  isPrivate: true,
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
        isPrivate: true,
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
            title: t('Deleted', { ns: 'common' }),
            description: t('Document deleted successfully.', { ns: 'common' }),
            type: 'success',
          });
        } else {
          // Roll back optimistic update in case of failure
          props.setDocuments([...props.documents, document]);
          props.setToast({
            title: t('Something went wrong', { ns: 'common' }),
            description: t('Could not delete the document.', { ns: 'project-home' }),
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
          title: t('Deleted', { ns: 'common' }),
          description: t('Document deleted successfully.', { ns: 'common' }),
          type: 'success',
        });

        setDocumentUpdated(true);
      } else {
        props.setToast({
          title: t('Something went wrong', { ns: 'common' }),
          description: t('Could not delete the document.', { ns: 'project-home' }),
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
      title: t('Something went wrong', { ns: 'common' }),
      description: t(error) || error,
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

  const isOwner = useCallback(
    (document: Document) => document.created_by === props.user.id,
    [props.user]
  );

  return (
    <>
      <header className='project-home-document-header-bar'>
        <h2>{t('Documents', { ns: 'project-sidebar' })}</h2>
        {props.isAdmin && (
          <div className='admin-actions'>
            <a
              href={`/${i18n.language}/projects/${props.project.id}/export/csv`}
              className='button'
              tabIndex={0}
            >
              <DownloadSimple size={20} />
              <span>{t('Export Annotations', { ns: 'common' })}</span>
            </a>
            <button
              className='button primary project-home-add-document'
              onClick={onAddDocument}
              tabIndex={0}
            >
              <Plus size={20} /> <span>{t('Add Document', { ns: 'project-home' })}</span>
            </button>
          </div>
        )}
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={onDragCancel}
      >
        <div className='project-home-grid-wrapper'>
          <div className='project-home-grid' role='grid'>
            <SortableContext
              items={props.documents}
              strategy={rectSortingStrategy}
            >
              {props.documents.map((document) => (
                <DocumentCard
                  className={classNames({ active: document.id === activeId })}
                  key={document.id}
                  isAdmin={props.isAdmin}
                  isDocumentsView
                  isOwner={isOwner(document)}
                  document={document}
                  context={defaultContext!}
                  onDelete={() => onDeleteDocument(document)}
                  onUpdate={onUpdateDocument}
                  onError={onError}
                  rtab={props.project.document_view_right}
                />
              ))}
            </SortableContext>
            <DragOverlay adjustScale style={{ transformOrigin: '0 0 ' }}>
              {activeDocument && (
                <DocumentCard
                  className='dragging'
                  key={activeDocument.id}
                  isAdmin={props.isAdmin}
                  document={activeDocument}
                  context={defaultContext!}
                  onDelete={() => {}}
                  onUpdate={() => {}}
                  onError={() => {}}
                />
              )}
            </DragOverlay>
          </div>
        </div>
      </DndContext>
      <div>
        <DocumentLibrary
          open={addOpen}
          onCancel={() => setAddOpen(false)}
          user={props.user}
          dataDirty={dataDirty || documentUpdated}
          clearDirtyFlag={() => {
            clearDirtyFlag();
            setDocumentUpdated(false);
          }}
          UploadActions={
            <UploadActions
              me={props.user}
              onUpload={open}
              onImport={onImportRemote}
              onSetUser={props.onSetUser}
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
        show={showUploads}
        closable={isIdle}
        uploads={uploads}
        onClose={() => setShowUploads(false)}
      />
      <input
        {...getInputProps()}
        aria-label={t('drag and drop target for documents', { ns: 'a11y' })}
      />
    </>
  );
};
