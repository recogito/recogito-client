import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify/functions';

export default defineConfig({
  integrations: [react()],
  output: 'server',
  adapter: netlify(),
  vite: {
    ssr: {
      noExternal: ['@radix-ui/*', '@phosphor-icons/*'],
    },
    optimizeDeps: {
      exclude: ['react-dropzone', 'uuid', 'react-table-library'],
    },
  },
});
