import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import { loadInstalledPlugins } from './installed-plugins.mjs';

const plugins = await loadInstalledPlugins();

export default defineConfig({
  adapter: netlify(),
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  integrations: [react(), ...plugins],
  output: 'server',
  vite: {
    ssr: {
      noExternal: ['clsx', '@phosphor-icons/*', '@radix-ui/*'],
    },
  },
});
