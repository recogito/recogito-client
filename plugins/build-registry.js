import fs from 'fs';

const pluginRoot = 'plugins';

const plugins = [];

try {
  console.log('Reading deployed plugins');

  const plugins = fs
    .readdirSync(pluginRoot, { withFileTypes: true })
    .filter(dir => dir.isDirectory())
    .map(dir => dir.name);

  plugins.forEach(p => console.log(`  - ${p}`));

  const imports = plugins.map(p => 
    `import ${p} from '../../../plugins/${p}/plugin.config.json';\n`);

  const configs = plugins.map(p => 
    `  { ...${p}, directory: '${p}' }\n`);

  const src = 
    `/** auto-generated plugin list **/\n` +
    `import type { PluginMetadata } from './PluginMetadata';\n\n` +
    imports.join('\n') +
    `\n` +
    `export const plugins: PluginMetadata[] = [\n` +
      configs.join(',\n') +
    `];`

  fs.writeFileSync('src/components/Plugins/deployedPlugins.ts', src, { encoding: 'utf8' })
} catch (error) {
  console.error('Error building plugin registry:', error);
}

