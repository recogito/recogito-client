import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { archiveDocument, getDocument, updateCollection } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import {
  ArrowLeftIcon,
  CheckFatIcon,
  WarningDiamondIcon,
} from '@phosphor-icons/react';
import {
  type MyProfile,
  type Collection as CollectionType,
  type Document,
  type Protocol,
} from 'src/Types';
import { CollectionDialog } from '../CollectionDialog/CollectionDialog';
import { CollectionDocumentsTable } from '../CollectionDocumentsTable';
import {
  UploadActions,
  UploadTracker,
  useDragAndDrop,
  useUpload,
} from '@apps/project-home/upload';
import type { FileRejection } from 'react-dropzone';
import { validateIIIF } from '@apps/project-home/upload/dialogs/useIIIFValidation';

import './Collection.css';
import { DocumentLibrary } from '@components/DocumentLibrary';
import { copyDocumentsToCollection } from '@backend/helpers/collectionHelpers';
import { I18nextProvider, useTranslation } from 'react-i18next';
import clientI18next from 'src/i18n/client';

interface CollectionsTableProps {
  collection: CollectionType;

  documents: Document[];

  me: MyProfile;
}

const Collection = (props: CollectionsTableProps) => {
  const { t, i18n } = useTranslation(['project-home', 'collection-management', 'a11y']);
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [collection, setCollection] = useState(props.collection);
  const [search, setSearch] = useState<string>('');
  const [documents, setDocuments] = useState(props.documents);
  const [filteredDocuments, setFilteredDocuments] = useState(props.documents);
  const [showUploads, setShowUploads] = useState(false);
  const [me, setMe] = useState(props.me);
  const [libraryOpen, setLibraryOpen] = useState(false);

  const [revisionDocument, setRevisionDocument] = useState<
    Document | undefined
  >(undefined);

  useEffect(() => {
    if (props.documents) {
      setDocuments(props.documents);
    }
  }, [props.documents]);

  const documentIds = useMemo(
    () => props.documents.map((d) => d.id),
    [props.documents]
  );

  const onError = (error: string) => {
    setToast({
      title: t('Something went wrong', { ns: 'project-home' }),
      description: error,
      type: 'error',
      icon: <WarningDiamondIcon color='red' />,
    });
  };

  const onCopyFileError = (docName: string) => {
    onError(t('fileCopyError', { ns: 'project-home', docName }));
  };

  const onLibraryDocumentsSelected = async (documentIds: string[]) => {
    const originalDocContent: { [docId: string]: Blob } = {};
    const failedDownloads: string[] = [];

    // fetch existing documents to get all their file contents
    for (let i = 0; i < documentIds.length; i++) {
      const docId = documentIds[i];
      const { data: doc, error: docError } = await getDocument(supabase, docId);
      if (docError) {
        failedDownloads.push(docId);
        onCopyFileError(doc.name);
      } else {
        if (doc.content_type && doc.bucket_id) {
          // XML, plaintext, PDF, stored image file (non-iiif)
          const { data: fileData, error: fileError } = await supabase.storage
            .from(doc.bucket_id)
            .download(doc.id);
          if (fileError) {
            failedDownloads.push(docId);
            onCopyFileError(doc.name);
          } else {
            originalDocContent[doc.id] = fileData;
          }
        } else if (
          doc.meta_data?.protocol === 'IIIF_IMAGE' ||
          doc.meta_data?.protocol === 'IIIF_PRESENTATION'
        ) {
          // IIIF: the image data is stored in doc.meta_data;
          // no need to do anything here, this will be set during the copy RPC.
          continue;
        } else {
          // unexpected content type and not IIIF
          failedDownloads.push(docId);
          onCopyFileError(doc.name);
        }
      }
    }

    // copy library documents to collection
    const { data, error } = await copyDocumentsToCollection(
      supabase,
      collection.id,
      documentIds.filter((id) => !failedDownloads.includes(id))
    );
    if (error) {
      onError('Could not copy documents into collection.');
      return;
    } else if (data) {
      const newDocs = data;
      const failedDocs: string[] = [];
      // copy file contents from existing document to new document
      for (let i = 0; i < newDocs.length; i++) {
        const newDoc = newDocs[i];
        // this should exclude remote IIIF
        if (
          newDoc.bucket_id &&
          Object.hasOwn(originalDocContent, newDoc.original_document_id)
        ) {
          const fileData = originalDocContent[newDoc.original_document_id];
          const { error } = await supabase.storage
            .from(newDoc.bucket_id)
            .upload(newDoc.id, fileData, {
              upsert: true,
              contentType: 'application/octet-stream',
            });
          if (error) {
            failedDocs.push(newDoc.id);
            onCopyFileError(newDoc.name);
          }
        }
      }
      // delete failed docs
      for (let i = 0; i < failedDocs.length; i++) {
        const docId = failedDocs[i];
        await archiveDocument(supabase, docId);
      }
      // update the list with successful docs
      const successfulDocs = newDocs.filter((d) => !failedDocs.includes(d.id));
      setDocuments(
        [...props.documents, ...successfulDocs].reduce<Document[]>(
          (all, document) =>
            all.some((d) => d.id === document.id) ? all : [...all, document],
          []
        )
      );
      if (successfulDocs.length > 0) {
        setToast({
          title: t('Copied', { ns: 'project-home' }),
          description: t('Document copied successfully.', {
            ns: 'project-home',
          }),
          type: 'success',
        });
      }
      setLibraryOpen(false);
    }
  };

  useEffect(() => {
    if (!search || search.length === 0) {
      setFilteredDocuments(documents);
    } else {
      const low = search.toLowerCase();
      setFilteredDocuments(
        documents.filter((d) => d.name?.toLowerCase().includes(low))
      );
    }
  }, [search, documents]);

  const { addUploads, isIdle, uploads } = useUpload((docs) => {
    setDocuments(
      [...props.documents, ...docs].reduce<Document[]>(
        (all, document) =>
          all.some((d) => d.id === document.id) ? all : [...all, document],
        []
      )
    );
    setRevisionDocument(undefined);
  });

  const onDrop = (accepted: File[] | string, rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      setToast({
        title: t('Something went wrong', { ns: 'project-home' }),
        description: t('Unsupported file format.', {
          ns: 'collection-management',
        }),
        type: 'error',
      });
    } else if (
      revisionDocument &&
      Array.isArray(accepted) &&
      accepted?.length > 1
    ) {
      setToast({
        title: t('Something went wrong', { ns: 'project-home' }),
        description: t('Only one document can be used as a revision.', {
          ns: 'collection-management',
        }),
        type: 'error',
      });
    } else {
      if (Array.isArray(accepted)) {
        addUploads(
          accepted.map((file) => ({
            name: revisionDocument?.name || file.name,
            file,
            collectionId: collection.id,
            isPrivate: false,
            collectionMetadata: {
              document_id:
                revisionDocument?.collection_metadata?.document_id ||
                `${collection.id}_${uuidv4()}`,
              revision_number:
                (revisionDocument?.collection_metadata?.revision_number || 0) +
                1,
            },
          }))
        );

        setShowUploads(true);
      } else if (typeof accepted === 'string') {
        validateIIIF(accepted, i18n.language).then(
          ({ isValid, result, error }) => {
            if (isValid) {
              addUploads([
                {
                  name: revisionDocument?.name || result?.label || accepted,
                  url: accepted,
                  protocol:
                    result?.type === 'image'
                      ? 'IIIF_IMAGE'
                      : 'IIIF_PRESENTATION',
                  collectionId: collection.id,
                  isPrivate: false,
                  collectionMetadata: {
                    document_id:
                      revisionDocument?.collection_metadata?.document_id ||
                      `${collection.id}_${uuidv4()}`,
                    revision_number:
                      (revisionDocument?.collection_metadata?.revision_number ||
                        0) + 1,
                  },
                },
              ]);

              setShowUploads(true);
            } else {
              setToast({
                title: t('Something went wrong', { ns: 'project-home' }),
                description: error,
                type: 'error',
              });
            }
          }
        );
      }
    }
  };

  // This actually archives the document
  const onDeleteDocumentFromCollection = (document: Document) => {
    archiveDocument(supabase, document.id).then(({ data }) => {
      if (data) {
        setToast({
          title: t('Deleted', { ns: 'project-home' }),
          description: t('Document deleted successfully.', {
            ns: 'collection-management',
          }),
          type: 'success',
        });
        setDocuments((prevDocuments) =>
          prevDocuments.filter((prevDoc) => prevDoc.id !== document.id)
        );
      } else {
        setToast({
          title: t('Something went wrong', { ns: 'project-home' }),
          description: t('Could not delete the document.', {
            ns: 'project-home',
          }),
          type: 'error',
        });
      }
    });
  };

  const { open: onUpload, getInputProps } = useDragAndDrop(onDrop);

  const onUploadRevision = (document: Document) => {
    setRevisionDocument(document);
  };

  useEffect(() => {
    if (
      revisionDocument?.collection_metadata?.document_id &&
      revisionDocument.collection_metadata.revision_number
    ) {
      onUpload();
    }
  }, [revisionDocument?.collection_metadata]);

  const onImportRemote = (
    protocol: Protocol,
    url: string,
    label?: string,
    document?: Document
  ) => {
    setShowUploads(true);

    addUploads([
      {
        name: document?.name || label || url,
        url,
        protocol,
        isPrivate: false,
        collectionId: collection.id,
        collectionMetadata: {
          document_id:
            document?.collection_metadata?.document_id ||
            `${collection.id}_${uuidv4()}`,
          revision_number:
            (document?.collection_metadata?.revision_number || 0) + 1,
        },
      },
    ]);
  };

  const handleUpdateCollection = (name: string) => {
    updateCollection(supabase, { id: props.collection.id, name }).then(
      ({ error, data }) => {
        if (error) {
          setToast({
            title: t('Something went wrong', { ns: 'project-home' }),
            description: t('Could not update collection.', {
              ns: 'collection-management',
            }),
            type: 'error',
            icon: <WarningDiamondIcon color='red' />,
          });
          return;
        } else {
          setToast({
            title: t('Success', { ns: 'collection-management' }),
            description: t('Collection has been updated.', {
              ns: 'collection-management',
            }),
            type: 'success',
            icon: <CheckFatIcon color='green' />,
          });
          setCollection(data);
        }
      }
    );
  };

  return (
    <div className='collection'>
      <ToastProvider>
        <TopBar
          onError={(error) => console.log(error)}
          me={me}
        />
        <div className='collection-header'>
          <div>
            <a
              href={`/${i18n.language}/collections`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeftIcon className='text-bottom' size={16} />
              <span>
                {t('Back to Collections', { ns: 'collection-management' })}
              </span>
            </a>
            <h1>{collection.name}</h1>
          </div>
        </div>
        <div className='collection-content'>
          <div className='collection-actions'>
            <div>
              <label htmlFor='search'>
                {t('Search Documents', { ns: 'collection-management' })}
              </label>
              <input
                autoFocus
                id='search'
                type='text'
                className='collection-documents-search'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div>
              <CollectionDialog
                collection={collection}
                onSave={handleUpdateCollection}
              />
              <UploadActions
                me={me}
                onUpload={onUpload}
                onImport={onImportRemote}
                onOpenLibrary={() => setLibraryOpen(true)}
                onSetUser={(user: MyProfile) => setMe(user)}
              />
            </div>
          </div>
          <div className='collection-documents-table'>
            {filteredDocuments.length > 0 ? (
              <CollectionDocumentsTable
                documents={filteredDocuments}
                onDelete={onDeleteDocumentFromCollection}
                onUpload={onUploadRevision}
                onImport={onImportRemote}
                setToast={setToast}
                setDocuments={setDocuments}
              />
            ) : (
              <p>
                {search
                  ? t('No documents matching search criteria', {
                      ns: 'collection-management',
                    })
                  : t('No documents', { ns: 'collection-management' })}
              </p>
            )}
          </div>
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
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
          <DocumentLibrary
            clearDirtyFlag={() => {}}
            dataDirty={false}
            disabledIds={documentIds}
            hideCollections
            isAdmin={false}
            onCancel={() => setLibraryOpen(false)}
            onDocumentsSelected={onLibraryDocumentsSelected}
            onError={onError}
            onUpdated={() => {}}
            onTogglePrivate={() => {}}
            open={libraryOpen}
            readOnly
            user={me}
          />
        </div>
      </ToastProvider>
    </div>
  );
};

export const CollectionWrapper = (props: CollectionsTableProps) => (
  <I18nextProvider i18n={clientI18next}>
    <Collection {...props} />
  </I18nextProvider>
);