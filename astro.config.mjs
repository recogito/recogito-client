import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

import RevisionsPlugin from '@recogito/plugin-revisions';
import GeoTaggingPlugin from '@recogito/plugin-geotagging';

export default defineConfig({
  integrations: [
    react(),
    GeoTaggingPlugin(),
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
