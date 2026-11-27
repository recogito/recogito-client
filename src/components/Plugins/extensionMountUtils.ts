import { lazy, type ComponentType } from 'react';

// Cache resolved extensions
const resolved = new Map<string, ComponentType<any>>();
const inflight = new Map<string, Promise<ComponentType<any>>>();

export const getResolvedExtension = (name: string) => resolved.get(name);

export const preloadExtension = (name: string): Promise<ComponentType<any>> => {
  const cached = inflight.get(name);
  if (cached) return cached;

  // Note: although dynamic imports support variables in the import path, variables
  // CANNOT CONTAIN A '/' CHARACTER! Runtime loading will fail as soon as the 
  // variable points to a sub-path!
  // Cf: https://stackoverflow.com/questions/59051144/dynamic-imports-using-complicated-path-in-react-js
  const promise = import(`../../plugins/generated/${name}.ts`)
    .then(mod => {
      resolved.set(name, mod.default);
      return mod.default as ComponentType<any>;
    })
    .catch(err => {
      inflight.delete(name); // allow a retry later
      throw err;
    });

  inflight.set(name, promise);

  return promise;
}

export const getLazy = (name: string) => lazy(() => 
  preloadExtension(name).then(component => ({ default: component })));