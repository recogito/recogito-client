import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';

export default defineConfig({
  adapter: netlify(),
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
  },
  integrations: [react()],
  output: 'server',
  vite: {
    ssr: {
      noExternal: ['clsx', '@phosphor-icons/*', '@radix-ui/*'],
    },
    optimizeDeps: {
      esbuildOptions: {
        target: 'esnext',
      },
    },
  },
});
