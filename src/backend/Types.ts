import type { PostgrestError } from '@supabase/supabase-js';

export type Response<T> = PromiseLike<{ error: PostgrestError | null, data: T }>;
