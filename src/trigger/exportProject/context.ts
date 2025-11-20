import type { SupabaseClient } from '@supabase/supabase-js';

const getContextIds = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const { data: contexts } = await supabase
    .from('contexts')
    .select('id')
    .eq('project_id', projectId);

  return contexts?.map((context) => context.id) || [];
};

export const exportContextDocuments = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const contextIds = await getContextIds(supabase, projectId);

  return supabase
    .from('context_documents')
    .select()
    .in('context_id', contextIds)
    .csv();
};

export const exportContextUsers = async (
  supabase: SupabaseClient,
  projectId: string
) => {
  const contextIds = await getContextIds(supabase, projectId);

  return supabase
    .from('context_users')
    .select()
    .in('context_id', contextIds)
    .csv();
}

export const exportContexts = async (
  supabase: SupabaseClient,
  projectId: string
) =>
  supabase
    .from('contexts')
    .select()
    .eq('project_id', projectId)
    .csv();