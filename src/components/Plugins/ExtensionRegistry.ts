import type { Extension } from '@recogito/studio-sdk';
import { matchesExtensionPoint } from './utils';

let registry: Extension[] = [];

try {
  const mod = await import('../../plugins/generated/registered.json', { assert: { type: 'json' } });
  registry = mod.default;
} catch {
  // File doesn't exist yet, use empty registry
  registry = [];
}

export const ExtensionRegistry = {

  listExtensions: (): Extension[] => {
    return registry;
  },

  getComponentsForExtensionPoint: (pattern?: string) => {
    // Return all
    if (!pattern) 
      return [...registry];

    // Match the pattern against 
    const matches = registry.filter(e => {
      return matchesExtensionPoint(pattern, e.extension_point);
    });

    return matches;
  }
  
}