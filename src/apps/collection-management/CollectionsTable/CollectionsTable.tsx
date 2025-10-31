import { Timestamp } from '@components/Timestamp';
import type { Collection, Translations } from 'src/Types';
import { CollectionActions } from './CollectionActions';
import { useState } from 'react';
import { CollectionDialog } from '../CollectionDialog/CollectionDialog';

interface CollectionsTableProps {
  i18n: Translations;

  collections: Collection[];

  onDelete: (collection: Collection) => void;

  onSave: (name: string, collectionId: string) => void;
}

export const CollectionsTable = (props: CollectionsTableProps) => {
  const { lang, t } = props.i18n;

  const [openMetadata, setOpenMetadata] = useState<string | null>(null);

  return (
    <table className='collections-table'>
      <thead>
        <tr>
          <th>{t['Name']}</th>
          <th>{t['Documents']}</th>
          <th>{t['Date Created']}</th>
          <th>{t['Date Updated']}</th>
          <th>{t['ID']}</th>
          <th aria-label={t['actions']}></th>
        </tr>
      </thead>
      <tbody>
        {props.collections
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((collection) => (
            <tr key={collection.id}>
              <td>
                <a href={`/${props.i18n.lang}/collections/${collection.id}`}>
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
                  <Timestamp datetime={collection.created_at} locale={lang} />
                )}
              </td>
              <td>
                {collection.updated_at && (
                  <Timestamp datetime={collection.updated_at} locale={lang} />
                )}
              </td>
              <td>{collection.id}</td>
              <td className='actions'>
                <CollectionActions
                  collection={collection}
                  i18n={props.i18n}
                  onDelete={props.onDelete}
                  onOpenMetadata={() => setOpenMetadata(collection.id)}
                />
                <CollectionDialog
                  open={openMetadata === collection.id}
                  i18n={props.i18n}
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
