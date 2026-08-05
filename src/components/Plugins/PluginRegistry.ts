import { matchesExtensionPoint } from '@recogito/studio-sdk';
import type { InstalledPlugin, Plugin, PluginInstallationConfig } from '@recogito/studio-sdk';
import registeredJson from '../../plugins/generated/registered.json';

const registry: Plugin[] = registeredJson as Plugin[];

const createPluginRegistry = () => {

  // List all plugins, optionally only those with extensions
  // for a specific extension point.
  const listAvailablePlugins = (pattern?: string): Plugin[] => {
    if (!pattern) return [...registry];

    // Match the pattern against plugins' extensions
    const matches = registry.filter(plugin => {
      const extensionPoints = (plugin.extensions || []).map(e => e.extension_point);
      return extensionPoints.some(e => matchesExtensionPoint(pattern, e));
    });

    return matches;
  }

  // Given a list of installed plugin instances on a project, 
  // resolve the full plugin configuration (plugin metadata + install configuration)
  const resolvePlugins = (installed: InstalledPlugin[], pattern?: string): PluginInstallationConfig[] => {
    const available = listAvailablePlugins(pattern);

    return installed.reduce<PluginInstallationConfig[]>((all, installed) => {
      const plugin = available.find(p => p.name === installed.plugin_name);
      return plugin ? [...all, { plugin, settings: installed  }] : all;
    }, []);
  }

  return {
    listAvailablePlugins,
    resolvePlugins
  }

}

export default createPluginRegistry();

