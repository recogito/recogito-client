import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

import ReconcilationPlugin from '@recogito/plugin-reconciliation-service';
import DukeUnrealExport from '@recogito/plugin-duke-unreal-export';

export default defineConfig({
  integrations: [
    react(),
    ReconcilationPlugin(),
    DukeUnrealExport()
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
