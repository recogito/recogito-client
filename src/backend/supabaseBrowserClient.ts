import { type SupabaseClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

// Not ideal but prevents the browser client from being generated
// on the server
// @ts-ignore
export const supabase: SupabaseClient =
  typeof window !== 'undefined' &&
  createBrowserClient(SUPABASE, SUPABASE_API_KEY);

// @ts-ignore
export const supabaseImplicit: SupabaseClient =
  typeof window !== 'undefined' &&
  createBrowserClient(SUPABASE, SUPABASE_API_KEY, {
    auth: { flowType: 'implicit' },
  });
