import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { Extension } from '@recogito/studio-sdk';
import type { PluginInstallationConfig } from './PluginInstallationConfig';
import { matchesExtensionPoint } from './utils';

interface PluginProviderContextValue {

  installed: PluginInstallationConfig[];

  pluginStates: { [plugin: string]: any };

  setPluginStates: React.Dispatch<React.SetStateAction<{
    [plugin: string]: any;
  }>>;

}

// @ts-ignore
const PluginProviderContext = createContext<PluginProviderContextValue>(undefined);

interface PluginProviderProps {

  installed: PluginInstallationConfig[];

  children: ReactNode;

}

/**
 * A simple helper for providing plugin-related hooks to (client-side) apps.
 */
export const PluginProvider = (props: PluginProviderProps) => {

  const { installed } = props;

  // Each plugin gets a global state for general use, managed by the PluginProvider
  const [pluginStates, setPluginStates] = useState<{ [plugin: string]: any }>({});

  return (
    <PluginProviderContext.Provider value={{ installed, pluginStates, setPluginStates }}>
      {props.children}
    </PluginProviderContext.Provider>
  )

}

export const usePlugins = (pattern: string) => {
  const { installed } = useContext(PluginProviderContext);
  return installed.filter(installed => 
      installed.plugin.extensions.map(e => 
        e.extension_point).some(e => matchesExtensionPoint(pattern, e)));
}

export const useExtensions = (pattern: string) => {
  const installed = usePlugins(pattern);
  return installed.reduce<Extension[]>((all, installed) => {
    return [
      ...all, 
      ...installed.plugin.extensions.filter(e => matchesExtensionPoint(pattern, e.extension_point))
    ];
  }, []);
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

export const useSharedPluginStateValue = <T extends unknown>(pluginId: string, key: string) => {
  const { state, setState } = useSharedPluginState(pluginId);

  const value = state[key];

  const setValue = (valueOrFunction: T) => {
    if (typeof valueOrFunction === 'function')
      setState((s: any) => ({ ...s, [key]: valueOrFunction(value) }))
    else 
      setState((s: any) => ({ ...s, [key]: valueOrFunction }))
  }

  return [value, setValue];
}