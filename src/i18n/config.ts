// We always need to use astro:config/client instead of astro:config/server
// due to an upstream bug in Astro where another page's CSS ends up being
// applied to the current page. astro:config/client is a subset of
// astro:config/server that includes everything we need here.

// todo: upgrading Astro might fix the bug, see https://github.com/withastro/astro/issues/18060
export { i18n } from 'astro:config/client';
