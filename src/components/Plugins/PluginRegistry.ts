import fs from 'fs';
import type { InstalledPlugin } from 'src/Types';
import type { PluginMetadata } from './PluginMetadata';
import type { PluginInstallationConfig } from './PluginInstallationConfig';

/** 
 * Important: that the plugin registry works ON THE SERVER ONLY, 
 * not on the client!
 */
const createPluginRegistry = () => {

  const pluginRoot = 'plugins';

  const plugins: PluginMetadata[] = [];

  try {
    const pluginDirs = fs.readdirSync(pluginRoot, { withFileTypes: true });

    for (const dir of pluginDirs) {
      if (dir.isDirectory()) {
        const configFilePath = `${pluginRoot}/${dir.name}/plugin.config.json`

        if (fs.existsSync(configFilePath)) {
          const config = JSON.parse(fs.readFileSync(configFilePath).toString());
          plugins.push({ ...config, directory: dir.name });
        }
      }
    }
  } catch (error) {
    console.error('Error loading addons:', error);
  }

  const listAvailablePlugins = (pattern?: string): PluginMetadata[] => {
    // Return all
    if (!pattern) 
      return [...plugins];

    const patternSegments = pattern.split('.');

    // Helper to 
    const matchesExtensionPoint = (extensionPoint: string) => {
      const termSegments = extensionPoint.split('.');

      if (patternSegments.length > termSegments.length)
        return false; // Query has more segments than the term

      for (let i = 0; i < patternSegments.length; i++) {
        if (termSegments[i] !== '*' && patternSegments[i] !== '*' && patternSegments[i] !== termSegments[i])
          return false; // Segments don't match
      }

      return true; // All segments match
    } 

    const matches = plugins.filter(p => {
      const extensionPoints = Object.keys(p.extension_points);
      return extensionPoints.some(e => matchesExtensionPoint(e));
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

