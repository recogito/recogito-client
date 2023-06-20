import type { SupabaseClient } from '@supabase/supabase-js';
import type { Response } from '@backend/Types';
import type { Document } from 'src/Types';

export const createDocument = (supabase: SupabaseClient, name: string, content_type?: string): Response<Document> =>
  supabase
    .from('documents')
    .insert({
      name,
      content_type,
      bucket_id: content_type ? 'documents' : undefined
    })
    .select()
    .single()
    .then(({ error, data }) => {
      return { error, data: data as Document }
    });

export const updateDocument = (supabase: SupabaseClient, document: Document): Response<Document> =>
  supabase 
    .from('documents')
    .update({...document })
    .eq('id', document.id)
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as Document }));