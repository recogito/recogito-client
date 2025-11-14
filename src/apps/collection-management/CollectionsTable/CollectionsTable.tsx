import { Timestamp } from '@components/Timestamp';
import type { Collection } from 'src/Types';
import { CollectionActions } from './CollectionActions';
import { useState } from 'react';
import { CollectionDialog } from '../CollectionDialog/CollectionDialog';
import { useTranslation } from 'react-i18next';

interface CollectionsTableProps {
  collections: Collection[];

  onDelete: (collection: Collection) => void;

  onSave: (name: string, collectionId: string) => void;
}

export const CollectionsTable = (props: CollectionsTableProps) => {
  const { t, i18n } = useTranslation(['collection-management', 'project-sidebar']);

  const [openMetadata, setOpenMetadata] = useState<string | null>(null);

  return (
    <table className='collections-table'>
      <thead>
        <tr>
          <th>{t('Name', { ns: 'collection-management' })}</th>
          <th>{t('Documents', { ns: 'project-sidebar' })}</th>
          <th>{t('Date Created', { ns: 'collection-management' })}</th>
          <th>{t('Date Updated', { ns: 'collection-management' })}</th>
          <th>{t('ID', { ns: 'collection-management' })}</th>
          <th aria-label={t('actions', { ns: 'collection-management' })}></th>
        </tr>
      </thead>
      <tbody>
        {props.collections
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((collection) => (
            <tr key={collection.id}>
              <td>
                <a href={`/${i18n.language}/collections/${collection.id}`}>
                  {collection.name}
                </a>
              </td>
              <td>
                {collection.document_count?.length
                  ? collection.document_count[0]?.count
                  : 0}
              </td>
              <td>
                {collection.created_at && (
                  <Timestamp
                    datetime={collection.created_at}
                    locale={i18n.language}
                  />
                )}
              </td>
              <td>
                {collection.updated_at && (
                  <Timestamp
                    datetime={collection.updated_at}
                    locale={i18n.language}
                  />
                )}
              </td>
              <td>{collection.id}</td>
              <td className='actions'>
                <CollectionActions
                  collection={collection}
                  onDelete={props.onDelete}
                  onOpenMetadata={() => setOpenMetadata(collection.id)}
                />
                <CollectionDialog
                  open={openMetadata === collection.id}
                  collection={collection}
                  noTrigger
                  onClose={() => setOpenMetadata(null)}
                  onSave={(name: string) => props.onSave(name, collection.id)}
                />
              </td>
            </tr>
          ))}
      </tbody>
    </table>
  );
};
