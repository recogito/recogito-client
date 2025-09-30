import type { Document } from 'src/Types';
import type { LibraryDocument } from './DocumentLibrary';

export const groupRevisionsByDocument = (
  collectionDocs: Document[]
): LibraryDocument[] => {
  const map: { [key: string]: Document[] } = {};
  for (let j = 0; j < collectionDocs.length; j++) {
    const doc = collectionDocs[j];
    if (doc.collection_metadata) {
      if (!map[doc.collection_metadata.document_id]) {
        map[doc.collection_metadata.document_id] = [];
      }

      map[doc.collection_metadata.document_id].push(doc);
    }
  }

  // Sort versions so the highest revision is in front
  const docs = [];
  for (const key in map) {
    map[key].sort((a, b) => {
      if (a.collection_metadata && b.collection_metadata) {
        return (
          b.collection_metadata.revision_number -
          a.collection_metadata.revision_number
        );
      }
      return 0;
    });
    const obj: LibraryDocument = {
      ...map[key][0],
      revisions: [],
      revision_count: 0,
    };
    for (let k = 0; k < map[key].length; k++) {
      const date = new Date(map[key][k].created_at as string);
      obj.revisions?.push({
        ...map[key][k],
        date_number: date.getTime(),
        published_date: date.toLocaleDateString(),
      });
    }
    obj.revisions?.sort((a, b) => (b.date_number || 0) - (a.date_number || 0));

    if (obj.revisions && obj.revisions.length > 0) {
      obj.revisions[0].is_latest = true;
      if (obj.id === obj.revisions[0].id) {
        obj.is_latest = true;
      }
    }

    obj.revision_count = obj.revisions ? obj.revisions.length : 0;
    docs.push(obj);
  }
  return docs;
};
