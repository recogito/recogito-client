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
  plugin_name: string
) => 
  supabase
    .from('installed_plugins')
    .delete()
    .match({ project_id, plugin_name });

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

type UpdateDefaultRouteResult = { error: { message: string } | null };

export const updateDefaultRouteProvider = async (
  supabase: SupabaseClient,
  project_id: string,
  from_plugin_name?: string,
  to_plugin_name?: string 
): Promise<UpdateDefaultRouteResult> => {
  const set = async (
    plugin_name: string,
    provides_default_route: boolean
  ): Promise<UpdateDefaultRouteResult> => {
    const { data, error } = await supabase
      .from('installed_plugins')
      .update({ provides_default_route })
      .match({ project_id, plugin_name })
      .select('plugin_name');

    if (error) return { error };

    if (!data || data.length === 0) {
      return {
        error: { message: `No installed plugin "${plugin_name}" was updated in project ${project_id}` }
      };
    }
    return { error: null };
  };

  if (from_plugin_name === to_plugin_name)
    return { error: null };

  if (!from_plugin_name && to_plugin_name)
    // built-in -> plugin
    return set(to_plugin_name, true);

  if (from_plugin_name && !to_plugin_name)
    // plugin -> built-in
    return set(from_plugin_name, false);
    
  if (from_plugin_name && to_plugin_name) {
    // plugin -> plugin
    const cleared = await set(from_plugin_name, false);
    if (cleared.error) return cleared;

    return await set(to_plugin_name, true);
  }

  return { error: null };
}