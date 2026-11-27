import { Component, Suspense, useMemo, type ReactNode } from 'react';
import type { Extension, PluginInstallationConfig } from '@recogito/studio-sdk';
import { getLazy, getResolvedExtension } from './extensionMountUtils';

interface ExtensionMountProps {

  extension: Extension;

  pluginConfig: PluginInstallationConfig;
  
  fallback?: ReactNode;

}

class ExtensionErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
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

  const name = extension.component_name;

  const Component = useMemo(() => (
    name ? getResolvedExtension(name) ?? getLazy(name) : undefined
  ), [name]);

  return Component ? (
    <ExtensionErrorBoundary>
      <Suspense fallback={fallback}>
        <Component 
          {...rest} 
          extension={extension} 
          plugin={pluginConfig.plugin} 
          settings={pluginConfig.settings.plugin_settings} />
      </Suspense>
    </ExtensionErrorBoundary>
  ) : null;

}