import { Suspense, lazy, useMemo } from 'react';
import type { ExtensionProps } from './ExtensionProps';

export const Extension = <T extends ExtensionProps = ExtensionProps>(props: T) => {

  const { extensionPoint, plugin } = props;

  const path = plugin.meta.extension_points[extensionPoint];

  const ExtensionComponent = useMemo(() => {
    return lazy(() => import(`../../../plugins/${plugin.meta.directory}/src/${path}/index.js`));
  }, [props.plugin]);

  return (
    <Suspense>
      <ExtensionComponent {...props} />
    </Suspense>
  )

}