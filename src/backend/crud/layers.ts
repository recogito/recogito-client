import type { SupabaseClient } from '@supabase/supabase-js';

export const archiveContextDocuments = (
  supabase: SupabaseClient,
  documentIds: string[],
  contextId: string
): Promise<void> =>
  new Promise((resolve, reject) => {
    supabase
      .rpc('archive_context_documents_rpc', {
        _context_id: contextId,
        _document_ids: documentIds,
      })
      .then(({ error, data }) => {
        if (error || !data) reject(error);
        else resolve();
      });
  });
