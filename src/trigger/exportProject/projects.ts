import type { SupabaseClient } from '@supabase/supabase-js';

export const exportProjects = async (
  supabase: SupabaseClient,
  projectId: string
) =>
  supabase
    .from('projects')
    .select()
    .eq('id', projectId);