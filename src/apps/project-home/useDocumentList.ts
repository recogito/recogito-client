import { addDocumentsToProject } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { useState } from 'react';
import type { Document } from 'src/Types';

export const useDocumentList = (
  projectId: string,
  contextId: string | undefined,
  onAdded: (documents: Document[]) => void
) => {
  const [dataDirty, setDataDirty] = useState(false);

  const addDocumentIds = (documentIds: string[]) => {
    if (projectId) {
      addDocumentsToProject(supabase, projectId, documentIds).then(
        ({ error, data }) => {
          if (error) {
            console.log(error);
          } else {
            setDataDirty(true);
            onAdded(data as Document[]);
          }
        }
      );
    }
  };

  return {
    addDocumentIds,
    dataDirty,
  };
};
