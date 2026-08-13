/* global process, URL */
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import node from '@astrojs/node';
import { loadInstalledPlugins } from './installed-plugins.mjs';

// Install plugins declared in the INSTALLED_PLUGINS environment variable
const plugins = await loadInstalledPlugins();

// Read SITE_URL from environment variables; fallback is used in local dev
const siteUrl = process.env.SITE_URL || 'http://localhost:4321';

// Extract the hostname (e.g. "site.com") and scheme (protocol without ":")
const url = new URL(siteUrl);
const allowedDomain = url.hostname;
const scheme = url.protocol.replace(':', '');

// https://astro.build/config
export default defineConfig({
  integrations: [react(), ...plugins],
  output: 'server',
  i18n: {
    locales: ['en', 'de'],
    defaultLocale: 'en',
    routing: {
      prefixDefaultLocale: true,
    },
  },
  adapter: node({
    mode: 'standalone',
  }),
  vite: {
    ssr: {
      noExternal: ['clsx', '@phosphor-icons/*', '@radix-ui/*']
    }
  },
  security: {
    checkOrigin: true,
    allowedDomains: [
      {
        scheme,
        host: allowedDomain,
      },
    ],
  }
});
