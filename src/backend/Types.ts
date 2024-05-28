import type { PostgrestError } from '@supabase/supabase-js';

export type Response<T> = PromiseLike<{
  error: PostgrestError | null;
  data: T;
}>;

export type UserRole = {
  user_id: string;

  role: 'default' | 'admin';
};

export type AvailableLayers = {
  document_id: string;
  layer_id: string;
  context_id: string;
  is_active: boolean;
  context_name: string;
};
