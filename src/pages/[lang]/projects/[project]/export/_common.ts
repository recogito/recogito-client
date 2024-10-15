import type { SupabaseClient } from '@supabase/supabase-js';
import { getMyProfile } from '@backend/crud';
import { getProjectPolicies } from '@backend/helpers';

export const canExport = async (supabase: SupabaseClient, projectId: string): Promise<boolean> => {
  const profile = await getMyProfile(supabase);
  if (profile.error || !profile.data)
    return false;

  const policies = await getProjectPolicies(supabase, projectId);
  if (policies.error)
    return false;

  const hasSelectPermissions = policies.data.get('project_documents').has('SELECT') || profile.data.isOrgAdmin;
  return hasSelectPermissions;
}