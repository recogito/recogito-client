import { addDocumentToProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useState } from 'react';
import type { Document } from 'src/Types';

let queue = Promise.resolve();

export const useDocumentList = (
  projectId: string,
  contextId: string | undefined,
  onAdded: (document: Document) => void
) => {
  const [dataDirty, setDataDirty] = useState(false);

  const addDocumentId = (i: string) => {
    if (contextId) {
      queue = queue.then(() =>
        addDocumentToProject(supabase, projectId, i).then(({ error, data }) => {
          if (error) {
            console.log(error);
          } else {
            setDataDirty(true);
            onAdded(data);
          }
        })
      );

      return i;
    }

    return 0;
  };

  const addDocumentIds = (documentIds: string[]) =>
    documentIds.forEach(addDocumentId);

  return {
    addDocumentIds,
    dataDirty,
  };
};
