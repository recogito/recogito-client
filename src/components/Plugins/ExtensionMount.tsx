import { Component, lazy, Suspense, useMemo } from 'react';
import type { Extension, PluginInstallationConfig } from '@recogito/studio-sdk';

interface ExtensionMountProps {

  extension: Extension;

  pluginConfig: PluginInstallationConfig;
  
  fallback?: React.ReactNode;

}

class ExtensionErrorBoundary extends Component<
  { children: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="plugin-error">
          Plugin failed to load
        </div>
      );
    }

    return this.props.children;
  }
}

export const ExtensionMount = <T extends ExtensionMountProps = ExtensionMountProps>(props: T) => {

  const { extension, pluginConfig, fallback, ...rest } = props;

  const Component = useMemo(() => {
    // Note: although 'lazy' supports variables in the import path, variables
    // CANNOT CONTAIN A '/' CHARACTER! Runtime loading will fail as soon as the 
    // variable points to a sub-path!
    // Cf: https://stackoverflow.com/questions/59051144/dynamic-imports-using-complicated-path-in-react-js
    return lazy(() => import(`../../plugins/generated/${extension.component_name}.ts`));
  }, [extension]);
  
  return (
    <ExtensionErrorBoundary>
      <Suspense fallback={fallback}>
        <Component 
          {...rest} 
          extension={extension} 
          plugin={pluginConfig.plugin} 
          settings={pluginConfig.settings.plugin_settings} />
      </Suspense>
    </ExtensionErrorBoundary>
  );

}