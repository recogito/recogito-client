import { Timestamp } from '@components/Timestamp';
import type { Collection, Translations } from 'src/Types';

interface CollectionsTableProps {
  i18n: Translations;

  collections: Collection[];
}

export const CollectionsTable = (props: CollectionsTableProps) => {
  const { lang, t } = props.i18n;

  return (
    <table className='collections-table'>
      <thead>
        <tr>
          <th>{t['Name']}</th>
          <th>{t['Documents']}</th>
          <th>{t['Date Created']}</th>
          <th>{t['Date Updated']}</th>
          <th>{t['ID']}</th>
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
            </tr>
          ))}
      </tbody>
    </table>
  );
};
