import { createClient } from '@supabase/supabase-js';

const SUPABASE = `https://${import.meta.env.PUBLIC_SUPABASE}`;
const SUPABASE_API_KEY = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export const supabase = createClient(SUPABASE, SUPABASE_API_KEY);