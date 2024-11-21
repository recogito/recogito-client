import { type SupabaseClient, createClient } from '@supabase/supabase-js';

const SUPABASE = import.meta.env.PUBLIC_SUPABASE;
const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

// Not ideal but prevents the browser client from being generated
// on the server
// @ts-ignore
export const supabase: SupabaseClient =
  typeof window !== 'undefined' && createClient(SUPABASE, SUPABASE_API_KEY);

export const createClientWithToken = (token: string): SupabaseClient =>
  createClient(SUPABASE, token);
