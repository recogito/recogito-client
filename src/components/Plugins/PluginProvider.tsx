import { ReactNode, createContext, useContext, useState } from 'react';
import type { PluginInstallationConfig } from './PluginInstallationConfig';

interface PluginProviderContextValue {

  plugins: PluginInstallationConfig[];

  pluginStates: { [plugin: string]: any };

  setPluginStates: React.Dispatch<React.SetStateAction<{
    [plugin: string]: any;
  }>>;

}

// @ts-ignore
const PluginProviderContext = createContext<PluginProviderContextValue>(undefined);

interface PluginProviderProps {

  plugins: PluginInstallationConfig[];

  children: ReactNode;

}

/**
 * A simple helper for providing plugin-related hooks to (client-side) apps.
 */
export const PluginProvider = (props: PluginProviderProps) => {

  const { plugins } = props;

  // Each plugin gets a global state for general use, managed by the PluginProvider
  const [pluginStates, setPluginStates] = useState<{ [plugin: string]: any }>({});

  return (
    <PluginProviderContext.Provider value={{ plugins, pluginStates, setPluginStates }}>
      {props.children}
    </PluginProviderContext.Provider>
  )

}

export const usePlugins = (extensionPoint: string) => {
  const { plugins } = useContext(PluginProviderContext);
  return plugins.filter(p => Object.keys(p.meta.extension_points).includes(extensionPoint));
}

export const useSharedPluginState = <T extends any = any>(pluginId: string) => {
  const { pluginStates, setPluginStates } = useContext(PluginProviderContext);

  const state = (pluginStates[pluginId] || {}) as T;

  const setState = (arg: any) => 
    setPluginStates(s => ({
      ...s,
      [pluginId]: arg
    }));

  return { state, setState };
}