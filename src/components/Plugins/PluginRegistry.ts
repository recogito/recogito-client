import type { Plugin } from '@recogito/studio-sdk';
import type { PluginInstallationConfig } from './PluginInstallationConfig';
import { matchesExtensionPoint } from './utils';
import type { InstalledPlugin } from 'src/Types';

let registry: Plugin[] = [];

try {
  const mod = await import('../../plugins/generated/registered.json', { assert: { type: 'json' } });
  registry = mod.default;
} catch {
  // File doesn't exist yet, use empty registry
  registry = [];
}

const createPluginRegistry = () => {

  // List all plugins, optionally only those with extensions
  // for a specific extension point.
  const listAvailablePlugins = (pattern?: string): Plugin[] => {
    if (!pattern) return [...registry];

    // Match the pattern against plugins' extensions
    const matches = registry.filter(plugin => {
      const extensionPoints = plugin.extensions.map(e => e.extension_point);
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

