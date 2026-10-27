/* global process */
import 'dotenv/config';
import { readFileSync } from 'node:fs';

/**
 * Loads the Recogito Studio plugins declared in the INSTALLED_PLUGINS
 * environment variable and returns them as an array of Astro integrations to be
 * added to `integrations` in the Astro config.
 *
 * INSTALLED_PLUGINS is a list of npm install specs separated by commas and/or
 * whitespace. Each entry can be an npm package name (optionally with a version),
 * a public GitHub repo, or a GitHub repo with an explicit package name. Example:
 *
 *   INSTALLED_PLUGINS="@recogito/plugin-geotagging, @recogito/plugin-ner@1.2.0,
 *     github:someone/my-plugin#v1.0.0, my-plugin@github:someone/my-plugin"
 *
 * The matching packages must be installed (present in package.json /
 * node_modules) for the import to resolve.
 */
export async function loadInstalledPlugins() {
  const entries = [
    ...new Set(
      (process.env.INSTALLED_PLUGINS || '')
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter(Boolean)
    ),
  ];

  const integrations = [];
  for (const entry of entries) {
    const name = resolvePackageName(entry);
    try {
      const mod = await import(name);
      integrations.push(mod.default());
    } catch (err) {
      throw new Error(
        `Could not load plugin "${entry}" declared in INSTALLED_PLUGINS. ` +
          `Check that it is an npm package name or public GitHub repo and that it is installed. ` +
          `(${err.message})`,
        { cause: err }
      );
    }
  }

  return integrations;
}

/**
 * Returns the package name to import for an INSTALLED_PLUGINS entry.
 */
function resolvePackageName(entry) {
  // "name", "@scope/name", or "name@<version | tag | github:owner/repo>"
  const named = entry.match(/^((?:@[^/@\s:]+\/)?[^/@\s:]+)(?:@.+)?$/);
  if (named) return named[1];

  // Unnamed GitHub repo: "owner/repo", "github:owner/repo#ref" or
  // "https://github.com/owner/repo". npm saves these in package.json as
  // "github:owner/repo[#ref]", so look up the name it was installed under.
  const repo = entry.match(
    /^(?:github:|(?:git\+)?https:\/\/github\.com\/)?([\w.-]+\/[\w.-]+?)(?:\.git)?(?:#.*)?$/i
  )?.[1];

  if (repo) {
    const source = `github:${repo}`.toLowerCase();
    const pkg = JSON.parse(
      readFileSync(new URL('./package.json', import.meta.url), 'utf8')
    );
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    const name = Object.keys(deps).find((dep) => {
      const spec = deps[dep].toLowerCase();
      return spec === source || spec.startsWith(`${source}#`);
    });
    if (name) return name;
  }

  throw new Error(
    `Could not find the package for plugin "${entry}" declared in INSTALLED_PLUGINS. ` +
      `Make sure it is installed, or give the package name explicitly, ` +
      `e.g. "my-plugin@github:owner/repo".`
  );
}
