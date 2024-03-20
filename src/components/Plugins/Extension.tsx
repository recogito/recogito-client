import { Suspense, lazy, useMemo } from 'react';
import type { ExtensionProps } from './ExtensionProps';

export const Extension = <T extends ExtensionProps = ExtensionProps>(props: T) => {

  const { extensionPoint, plugin } = props;

  const path = plugin.meta.extension_points[extensionPoint];

  const ExtensionComponent = useMemo(() => {
    // Note: although 'lazy' supports variables in the import path, variables
    // CANNOT CONTAIN A '/' CHARACTER! Runtime loading will fail as soon as the 
    // variable points to a sub-path!
    // Cf: https://stackoverflow.com/questions/59051144/dynamic-imports-using-complicated-path-in-react-js
    return lazy(() => import(`../../../plugins/${plugin.meta.directory}/src/${path}/index.js`));
  }, [props.plugin]);

  return (
    <Suspense>
      <ExtensionComponent {...props} />
    </Suspense>
  )

}