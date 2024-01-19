import type { PostgrestError } from '@supabase/supabase-js';

export type Response<T> = PromiseLike<{
  error: PostgrestError | null;
  data: T;
}>;

export interface ProjectDocument {
  id: string;

  created_at: string;

  created_by: string;

  updated_at?: string;

  updated_by?: string;

  project_id: string;

  document_id: string;
}
