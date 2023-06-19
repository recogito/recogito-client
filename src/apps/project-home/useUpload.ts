import { useCallback } from 'react';
import { initDocument } from '@backend/helpers/documentHelpers';
import { supabase } from '@backend/supabaseBrowserClient';
import type { Context, Document, Layer, Project } from 'src/Types';

export const useUpload = (
  project: Project,
  context: Context,
  onSuccess: (document: Document, defaultLayer: Layer) => void,
  onError: (error: string) => void
) => useCallback((files: File[]) => {
  const f = files[0];

  initDocument(supabase, f.name, project.id, context.id, f)
    .then(({ document, defaultLayer }) => {
      onSuccess(document, defaultLayer);
    })
    .catch(error => {
      onError(error);
    })
}, []);