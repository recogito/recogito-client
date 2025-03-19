import type { SupabaseClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';
import type { Response } from '@backend/Types';
import type { InstalledPlugin } from '@recogito/studio-sdk';

export const getInstalledPlugins = (
  supabase: SupabaseClient, 
  projectId: string
): Response<InstalledPlugin[]> =>
  supabase
    .from('installed_plugins')
    .select()
    .eq('project_id', projectId)
    .then(({ error, data }) => ({ error, data: data as InstalledPlugin[] }));

export const insertInstalledPlugin = (
  supabase: SupabaseClient,
  project_id: string,
  plugin_name: string
): Response<InstalledPlugin> =>
  supabase  
    .from('installed_plugins')
    .insert({
      project_id,
      plugin_name,
      plugin_id: uuidv4() // Just a hack...
    })
    .select()
    .single()
    .then(({ error, data }) => ({ error, data: data as InstalledPlugin }));

export const deleteInstalledPlugin = (
  supabase: SupabaseClient,
  project_id: string,
  plugin_id: string
) => 
  supabase
    .from('installed_plugins')
    .delete()
    .match({ project_id, plugin_id });

export const updatePluginSettings = (
  supabase: SupabaseClient,
  project_id: string,
  plugin_name: string,
  plugin_settings: any
) =>
  supabase
    .from('installed_plugins')
    .update({
      plugin_settings
    })
    .match({
      project_id,
      plugin_name
    });