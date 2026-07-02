/* global process */
import 'dotenv/config';

/**
 * Loads the Recogito Studio plugins declared in the INSTALLED_PLUGINS
 * environment variable and returns them as an array of Astro integrations to be
 * added to `integrations` in the Astro config.
 *
 * INSTALLED_PLUGINS is a list of npm package names separated by commas and/or
 * whitespace. Example:
 *
 *   INSTALLED_PLUGINS="@recogito/plugin-geotagging, @recogito/plugin-ner"
 *
 * The matching packages must be installed (present in package.json /
 * node_modules) for the import to resolve.
 */
export async function loadInstalledPlugins() {
  const names = [
    ...new Set(
      (process.env.INSTALLED_PLUGINS || '')
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  const integrations = [];
  for (const name of names) {
    try {
      const mod = await import(name);
      integrations.push(mod.default());
    } catch (err) {
      throw new Error(
        `Could not load plugin "${name}" declared in INSTALLED_PLUGINS. ` +
          `Check that it is the exact npm package name and that it is installed. ` +
          `(${err.message})`,
        { cause: err }
      );
    }
  }

  return integrations;
}
