import type { Plugin } from '@recogito/studio-sdk';
import type { InstalledPlugin } from 'src/Types';

export interface PluginInstallationConfig {

  plugin: Plugin;

  settings: InstalledPlugin;

}