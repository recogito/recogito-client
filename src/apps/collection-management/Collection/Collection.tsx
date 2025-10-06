import { useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { updateCollection } from '@backend/crud';
import { supabase } from '@backend/supabaseBrowserClient';
import { Toast, type ToastContent, ToastProvider } from '@components/Toast';
import { TopBar } from '@components/TopBar';
import { ArrowLeft, CheckFat, WarningDiamond } from '@phosphor-icons/react';
import type {
  MyProfile,
  Collection as CollectionType,
  Document,
  Translations,
  Protocol,
} from 'src/Types';
import { CollectionDialog } from '../CollectionDialog/CollectionDialog';
import { CollectionDocumentsTable } from '../CollectionDocumentsTable';
import { UploadActions, UploadTracker, useDragAndDrop, useUpload } from '@apps/project-home/upload';
import type { FileRejection } from 'react-dropzone';
import { validateIIIF } from '@apps/project-home/upload/dialogs/useIIIFValidation';

import './Collection.css';

interface CollectionsTableProps {
  i18n: Translations;

  collection: CollectionType;

  documents: Document[];

  me: MyProfile;
}

export const Collection = (props: CollectionsTableProps) => {
  const { lang, t } = props.i18n;
  const [toast, setToast] = useState<ToastContent | null>(null);
  const [collection, setCollection] = useState(props.collection);
  const [search, setSearch] = useState<string>('');
  const [documents, setDocuments] = useState(props.documents);
  const [filteredDocuments, setFilteredDocuments] = useState(props.documents);
  const [showUploads, setShowUploads] = useState(false);
  const [me, setMe] = useState(props.me);

  const [revisionDocument, setRevisionDocument] = useState<Document | undefined>(undefined);

  useEffect(() => {
    if (props.documents) {
      setDocuments(props.documents);
    }
  }, [props.documents]);

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

  const { addUploads, isIdle, uploads } = useUpload(
    (docs) => {
      setDocuments(
        [...props.documents, ...docs].reduce<Document[]>(
          (all, document) =>
            all.some((d) => d.id === document.id) ? all : [...all, document],
          []
        )
      );
      setRevisionDocument(undefined);
    }
  );

  const onDrop = (accepted: File[] | string, rejected: FileRejection[]) => {
    if (rejected.length > 0) {
      setToast({
        title: 'Sorry',
        description: 'Unsupported file format.',
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
              document_id: revisionDocument?.collection_metadata?.document_id || `${collection.name}_${uuidv4()}`,
              revision_number: (revisionDocument?.collection_metadata?.revision_number || 0) + 1,
            }
          }))
        );

        setShowUploads(true);
      } else if (typeof accepted === 'string') {
        validateIIIF(accepted, props.i18n).then(
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
                    document_id: revisionDocument?.collection_metadata?.document_id || `${collection.name}_${uuidv4()}`,
                    revision_number: (revisionDocument?.collection_metadata?.revision_number || 0) + 1,
                  }
                },
              ]);

              setShowUploads(true);
            } else {
              setToast({
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

  const { open: onUpload, getInputProps } = useDragAndDrop(onDrop);

  const onUploadRevision = (document: Document) => {
    setRevisionDocument(document);
  }

  useEffect(() => {
    if (revisionDocument?.collection_metadata?.document_id && revisionDocument.collection_metadata.revision_number) {
      onUpload();
    }
  }, [revisionDocument?.collection_metadata])

  const onImportRemote = (protocol: Protocol, url: string, label?: string, document?: Document) => {
    setShowUploads(true);

    addUploads([
      {
        name: document?.name || label || url,
        url,
        protocol,
        isPrivate: false,
        collectionId: collection.id,
        collectionMetadata: {
          document_id: document?.collection_metadata?.document_id || `${collection.name}_${uuidv4()}`,
          revision_number: (document?.collection_metadata?.revision_number || 0) + 1,
        }
      },
    ]);
  };

  const handleUpdateCollection = (name: string) => {
    updateCollection(supabase, { id: props.collection.id, name }).then(
      ({ error, data }) => {
        if (error) {
          setToast({
            title: t['Something went wrong'],
            description: t['Could not update collection.'],
            type: 'error',
            icon: <WarningDiamond color='red' />,
          });
          return;
        } else {
          setToast({
            title: t['Success'],
            description: t['Collection has been updated.'],
            type: 'success',
            icon: <CheckFat color='green' />,
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
          i18n={props.i18n}
          onError={(error) => console.log(error)}
          me={me}
        />
        <div className='collection-header'>
          <div>
            <a
              href={`/${lang}/collections`}
              style={{ marginTop: 15, zIndex: 1000 }}
            >
              <ArrowLeft className='text-bottom' size={16} />
              <span>{t['Back to Collections']}</span>
            </a>
            <h1>{collection.name}</h1>
          </div>
        </div>
        <div className='collection-content'>
          <div className='collection-actions'>
            <div>
              <label htmlFor='search'>{t['Search Documents']}</label>
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
                i18n={props.i18n}
              />
              <UploadActions
                i18n={props.i18n}
                me={me}
                onUpload={onUpload}
                onImport={onImportRemote}
                onSetUser={(user: MyProfile) => setMe(user)}
              />
            </div>
          </div>
          <div className='collection-documents-table'>
            {filteredDocuments.length > 0 ? (
              <CollectionDocumentsTable
                documents={filteredDocuments}
                i18n={props.i18n}
                onUpload={onUploadRevision}
                onImport={onImportRemote}
                setToast={setToast}
                setDocuments={setDocuments}
              />
            ) : (
              <p>
                {search
                  ? t['No documents matching search criteria']
                  : t['No documents']}
              </p>
            )}
          </div>
          <Toast
            content={toast}
            onOpenChange={(open) => !open && setToast(null)}
          />
          <UploadTracker
            i18n={props.i18n}
            show={showUploads}
            closable={isIdle}
            uploads={uploads}
            onClose={() => setShowUploads(false)}
          />
          <input
            {...getInputProps()}
            aria-label={t['drag and drop target for documents']}
          />
        </div>
      </ToastProvider>
    </div>
  );
};
