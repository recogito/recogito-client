import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
import plugin3D from '@recogito/plugin-duke-unreal-export';
import pluginReconciliation from '@recogito/plugin-reconciliation-service'


export default defineConfig({
  integrations: [
    react(),
    plugin3D(),
    pluginReconciliation(),
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
