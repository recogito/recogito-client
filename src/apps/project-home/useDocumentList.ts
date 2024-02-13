import { addDocumentToProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useState } from 'react';
import type { DocumentInContext } from 'src/Types';

let queue = Promise.resolve();

export const useDocumentList = (
  projectId: string,
  contextId: string | undefined,
  onAdded: (document: DocumentInContext) => void
) => {
  const [dataDirty, setDataDirty] = useState(false);

  const addDocumentId = (i: string) => {
    if (contextId) {
      queue = queue
        .then(() =>
          addDocumentToProject(supabase, projectId, contextId, i).then(
            (document) => {
              setDataDirty(true);
              onAdded(document);
            }
          )
        )
        .catch((error) => {
          console.log(error);
        });

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
