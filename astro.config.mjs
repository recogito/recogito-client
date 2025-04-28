import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

import RevisionsPlugin from '@recogito/plugin-revisions';

export default defineConfig({
  integrations: [
    react(),
    RevisionsPlugin()
  ],
  output: 'server',
  adapter: netlify(),
  vite: {
    ssr: {
      noExternal: ['clsx', '@phosphor-icons/*', '@radix-ui/*']
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  }
});
