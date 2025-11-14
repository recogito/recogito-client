import type { LibraryDocument } from '@components/DocumentLibrary';
import { groupRevisionsByDocument } from '@components/DocumentLibrary/utils';
import { useEffect, useState } from 'react';
import type { Document, Protocol } from 'src/Types';
import { CollectionManagementDocumentActions } from './CollectionManagementDocumentActions';
import { MetadataModal } from '@components/MetadataModal';
import type { ToastContent } from '@components/Toast';
import { useTranslation } from 'react-i18next';

interface CollectionDocumentsTableProps {

  documents: Document[];

  onDelete(document?: Document): void;

  onImport(
    format: Protocol,
    url: string,
    label?: string,
    document?: Document
  ): void;

  onUpload(document?: Document): void;

  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;

  setToast(content: ToastContent): void;
}

export const CollectionDocumentsTable = (
  props: CollectionDocumentsTableProps
) => {
  const { t } = useTranslation(['collection-management', 'common']);

  const [groupedDocs, setGroupedDocs] = useState<LibraryDocument[]>(
    props.documents
  );
  const [openMetadata, setOpenMetadata] = useState<string | null>(null);

  useEffect(() => {
    setGroupedDocs(groupRevisionsByDocument(props.documents));
  }, [props.documents]);

  const onUpdateDocument = (document: Document) => {
    props.setToast({
      title: t('Success', { ns: 'common' }),
      description: t('Document has been updated.', { ns: 'collection-management' }),
      type: 'success',
    });
    props.setDocuments((prev: Document[]) =>
      prev.map((d) => (d.id === document.id ? document : d))
    );
  };

  const onError = (error: string) => {
    props.setToast({
      title: t('Something went wrong', { ns: 'common' }),
      description: t(error) || error,
      type: 'error',
    });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>{t('Name', { ns: 'common' })}</th>
          <th>{t('Document Type', { ns: 'common' })}</th>
          <th>{t('Revision Count', { ns: 'common' })}</th>
          <th>{t('Latest Revision', { ns: 'common' })}</th>
          <th aria-label={t('actions', { ns: 'collection-management' })}></th>
        </tr>
      </thead>
      <tbody>
        {groupedDocs
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((document) => (
            <tr key={document.id}>
              <td>{document.name}</td>
              <td>{document.content_type}</td>
              <td>{document.revisions?.length}</td>
              <td>
                {document.revisions?.length &&
                  document.revisions[0].collection_metadata?.revision_number}
              </td>
              <td className='actions'>
                <CollectionManagementDocumentActions
                  document={document}
                  onDelete={props.onDelete}
                  onImport={props.onImport}
                  onOpenMetadata={() => setOpenMetadata(document.id)}
                  onUpload={props.onUpload}
                />
                <MetadataModal
                  open={openMetadata === document.id}
                  document={document}
                  onClose={() => setOpenMetadata(null)}
                  onUpdated={onUpdateDocument}
                  onError={onError}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
