import type { LibraryDocument } from '@components/DocumentLibrary';
import { groupRevisionsByDocument } from '@components/DocumentLibrary/utils';
import { useEffect, useState } from 'react';
import type { Document, Translations } from 'src/Types';
import { CollectionManagementDocumentActions } from './CollectionManagementDocumentActions';
import { MetadataModal } from '@components/MetadataModal';
import type { ToastContent } from '@components/Toast';

interface CollectionDocumentsTableProps {
  i18n: Translations;

  documents: Document[];

  setDocuments: React.Dispatch<React.SetStateAction<Document[]>>;

  setToast(content: ToastContent): void;
}

export const CollectionDocumentsTable = (
  props: CollectionDocumentsTableProps
) => {
  const { t } = props.i18n;

  const [groupedDocs, setGroupedDocs] = useState<LibraryDocument[]>(
    props.documents
  );
  const [openMetadata, setOpenMetadata] = useState<string | null>(null);

  useEffect(() => {
    setGroupedDocs(groupRevisionsByDocument(props.documents));
  }, [props.documents]);

  const onUpdateDocument = (document: Document) => {
    props.setToast({
      title: t['Success'],
      description: t['Document has been updated.'],
      type: 'success',
    });
    props.setDocuments((prev: Document[]) =>
      prev.map((d) => (d.id === document.id ? document : d))
    );
  };

  const onError = (error: string) => {
    props.setToast({
      title: t['Something went wrong'],
      description: t[error] || error,
      type: 'error',
    });
  };

  return (
    <table>
      <thead>
        <tr>
          <th>{t['Name']}</th>
          <th>{t['Document Type']}</th>
          <th>{t['Revision Count']}</th>
          <th>{t['Latest Revision']}</th>
          <th aria-label={t['actions']}></th>
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
                  i18n={props.i18n}
                  document={document}
                  onOpenMetadata={() => setOpenMetadata(document.id)}
                />
                <MetadataModal
                  open={openMetadata === document.id}
                  i18n={props.i18n}
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
