import type { InstalledPlugin } from 'src/Types';
import type { PluginMetadata } from './PluginMetadata';
import type { PluginInstallationConfig } from './PluginInstallationConfig';
import { matchesExtensionPoint } from './utils';

import { plugins } from './deployedPlugins';

/** 
 * Important: that the plugin registry works ON THE SERVER ONLY, 
 * not on the client!
 */
const createPluginRegistry = () => {

  const listAvailablePlugins = (pattern?: string): PluginMetadata[] => {
    // Return all
    if (!pattern) 
      return [...plugins];

    // Match the pattern against 
    const matches = plugins.filter(p => {
      const extensionPoints = Object.keys(p.extension_points);
      return extensionPoints.some(e => matchesExtensionPoint(pattern, e));
    });

    return matches;
  }

  const resolvePlugins = (installed: InstalledPlugin[], pattern?: string): PluginInstallationConfig[] => {
    const available = listAvailablePlugins(pattern);

    return installed.reduce<PluginInstallationConfig[]>((all, installed) => {
      const meta = available.find(p => p.id === installed.plugin_id);
      return meta ? [...all, { meta, settings: installed  }] : all;
    }, []);
  }
  
  return {
    listAvailablePlugins,
    resolvePlugins
  }

}

export default createPluginRegistry();

