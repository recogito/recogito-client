import type { Response } from '@backend/Types';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Layer } from 'src/Types';

export const createLayer = (
  supabase: SupabaseClient,
  document_id: string,
  project_id: string,
  name?: string,
  description?: string
): Response<Layer> =>
  supabase
    .from('layers')
    .insert({
      document_id,
      project_id,
      name,
      description,
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Layer }));

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
