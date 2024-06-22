import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  integrations: [
    react()
  ],
  output: 'server',
  adapter: netlify({
    edgeMiddleware: true
  }),
  vite: {
    ssr: {
      noExternal: ['clsx']
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext'
      }
    }
  },
});
