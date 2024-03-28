import { useEffect, useMemo, useState } from 'react';
import { CloudArrowUp, DownloadSimple, Plus } from '@phosphor-icons/react';
import type { FileRejection } from 'react-dropzone';
import { supabase } from '@backend/supabaseBrowserClient';
import { useProjectPolicies } from '@backend/hooks/usePolicies';
import { archiveLayer, setDocumentPrivacy } from '@backend/crud';
import { DocumentCard } from '@components/DocumentCard';
import { Toast, ToastContent, ToastProvider } from '@components/Toast';
import {
  UploadActions,
  UploadFormat,
  UploadTracker,
  useUpload,
  useDragAndDrop,
} from './upload';
import { useDocumentList } from './useDocumentList';
import { DocumentLibrary } from '../../components/DocumentLibrary';
import { ProjectHeader } from './ProjectHeader';

import type {
  Document,
  DocumentInContext,
  ExtendedProjectData,
  Invitation,
  MyProfile,
  Translations,
} from 'src/Types';

import './ProjectHome.css';
import { TopBar } from '@components/TopBar';
import { BackButtonBar } from '@components/BackButtonBar';

export interface ProjectHomeProps {
  i18n: Translations;

  project: ExtendedProjectData;

  projects: ExtendedProjectData[];

  documents: DocumentInContext[];

  invitations: Invitation[];

  user: MyProfile;
}

export const ProjectHome = (props: ProjectHomeProps) => {
  const { lang, t } = props.i18n;

  const [project, setProject] = useState(props.project);

  const [addOpen, setAddOpen] = useState(false);

  const defaultContext = project.contexts.find((c) => c.is_project_default);

  const [documents, setDocuments] = useState<DocumentInContext[]>(
    props.documents
  );

  const projectPolicies = useProjectPolicies(project.id);

  const isAdmin = projectPolicies?.get('projects').has('UPDATE');

  const [toast, setToast] = useState<ToastContent | null>(null);

  const [showUploads, setShowUploads] = useState(false);

  const [documentUpdated, setDocumentUpdated] = useState(false);

  const [tab, setTab] = useState<'documents' | 'assignments' | undefined>();

  const { addUploads, isIdle, uploads, dataDirty, clearDirtyFlag } = useUpload(
    (document) => setDocuments((d) => [...d, document])
  );

  const documentIds = useMemo(() => documents.map((d) => d.id), [documents]);

  useEffect(() => {
    if (!tab && projectPolicies) {
      if (isAdmin) {
        setTab('documents');
      } else {
        setTab('assignments')
      }
    }
  }, [isAdmin])

  const { addDocumentIds } = useDocumentList(
    project.id,
    defaultContext?.id,
    (document) => setDocuments((d) => [...d, document])
  );

  const onDrop = (accepted: File[] | string, rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      setToast({
        title: 'Sorry',
        description: 'Unsupported file format.',
        type: 'error',
      });
    } else {
      setShowUploads(true);

      if (Array.isArray(accepted)) {
        addUploads(
          accepted.map((file) => ({
            name: file.name,
            projectId: project.id,
            contextId: defaultContext!.id,
            file,
          }))
        );
      } else if (typeof accepted === 'string') {
        // IIIF URL
        addUploads([
          {
            name: accepted, // TODO find a better solution
            projectId: project.id,
            contextId: defaultContext!.id,
            url: accepted,
          },
        ]);
      }
    }
  };

  const { getRootProps, getInputProps, isDragActive, open } =
    useDragAndDrop(onDrop);

  const onImportRemote = (format: UploadFormat, url: string) => {
    setShowUploads(true);

    addUploads([
      {
        name: url, // TODO find a better solution
        projectId: project.id,
        contextId: defaultContext!.id,
        url,
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
        setToast({
          title: t['Deleted'],
          description: t['Document deleted successfully.'],
          type: 'success',
        });
      })
      .catch(() => {
        // Roll back optimistic update in case of failure
        setDocuments((documents) => [...documents, document]);
        setToast({
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
    setToast({
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

  const handleSwitchTab = (tab: 'documents' | 'assignments') => {

  }

  const handleGotoSettings = () => {

  }

  const handleGotoUsers = () => {

  }

  return (
    <>
      <TopBar invitations={props.invitations} i18n={props.i18n} onError={onError} projects={props.projects} me={props.user} />
      <BackButtonBar i18n={props.i18n} />
      <ProjectHeader
        i18n={props.i18n} isAdmin={isAdmin || false}
        name={props.project.name}
        description={props.project.description || ''}
        currentTab={isAdmin ? tab : undefined}
        onSwitchTab={handleSwitchTab}
        onGotoSettings={handleGotoSettings}
        onGotoUsers={handleGotoUsers}
      />
      <div className='project-home'>
        <ToastProvider>
          <>
            <div>
              {isAdmin && (
                <div className='admin-actions'>
                  <button className='primary' onClick={onAddDocument}>
                    <Plus size={20} /> <span>{t['Add Document']}</span>
                  </button>
                  <a
                    href={`/${lang}/projects/${project.id}/export/csv`}
                    className='button'
                  >
                    <DownloadSimple size={20} />
                    <span>{t['Export annotations as CSV']}</span>
                  </a>
                </div>
              )}
            </div>

            <div
              className='project-home-grid-wrapper'
              {...(isAdmin ? getRootProps() : {})}
            >
              <div
                className='project-home-grid'
                style={isDragActive ? { pointerEvents: 'none' } : undefined}
              >
                {documents.map((document) => (
                  <DocumentCard
                    key={document.id}
                    isDefaultContext
                    isAdmin={isAdmin}
                    i18n={props.i18n}
                    document={document}
                    context={defaultContext!}
                    onDelete={() => onDeleteDocument(document)}
                    onUpdate={onUpdateDocument}
                    onError={onError}
                  />
                ))}
              </div>

              {isDragActive && (
                <div className='dropzone-hint-wrapper'>
                  <div className='dropzone-hint'>
                    <div className='dropzone-hint-popup'>
                      <CloudArrowUp size={32} />
                      <h1>
                        Drop files or links to IIIF manifests to add them to your
                        project.
                      </h1>
                      <p>Supported file formats: plaint text (UTF-8)</p>
                    </div>
                  </div>
                </div>
              )}
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
                isAdmin={isAdmin}
              />
            </div>
            <UploadTracker
              i18n={props.i18n}
              show={showUploads}
              closable={isIdle}
              uploads={uploads}
              onClose={() => setShowUploads(false)}
            />

            <Toast
              content={toast}
              onOpenChange={(open) => !open && setToast(null)}
            />
          </>
        </ToastProvider>

        <input {...getInputProps()} />
      </div>
    </>
  );
};
