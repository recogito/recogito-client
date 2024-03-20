import type { PluginMetadata } from './PluginMetadata';
import type { InstalledPlugin } from 'src/Types';

export interface PluginInstallationConfig {

  meta: PluginMetadata;

  settings: InstalledPlugin;

}