import { useMemo, useState } from 'react';
import { CaretDownIcon, CheckIcon, InfoIcon, WarningIcon } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { PluginInstallationConfig } from '@recogito/studio-sdk';
import { supabase } from '@backend/supabaseBrowserClient';
import { updateDefaultRouteProvider } from '@backend/helpers';
import { TinySaveIndicator, type SaveState } from '@components/TinySaveIndicator';
import type { ExtendedProjectData } from 'src/Types';

import './DocumentBehavior.css';

interface DocumentBehaviorProps {
  project: ExtendedProjectData;

  installedPlugins: PluginInstallationConfig[];

  onUpdateBehavior(plugins: PluginInstallationConfig[]): void;
}

// Radix Select doesn't allow empty string (would be uncontrolled mode)
const DEFAULT_VALUE = '__default__';

export const DocumentBehavior = (props: DocumentBehaviorProps) => {    
  const initialDefaultRouteProvider = 
    props.installedPlugins.find(i => i.settings.provides_default_route)?.plugin.name;

  const [routeProvider, setRouteProvider] = useState(initialDefaultRouteProvider);

  const [saveState, setSaveState] = useState<SaveState>('idle');
  const [error, setError] = useState<string | undefined>();

  const pluginsProvidingDefaultRoute = useMemo(() => (
    props.installedPlugins
      .filter(plugin => (plugin.plugin.extensions || [])
        .some(extension => extension.extension_point === 'project:document-default-view'))
  ), [props.installedPlugins]);

  const onValueChange = async (value: string) => {
    const from = initialDefaultRouteProvider;
    const to = value === DEFAULT_VALUE ? undefined : value;
    if (from === to) return;

    setRouteProvider(to);
    setError(undefined);
    setSaveState('saving');

    const { error } = await updateDefaultRouteProvider(supabase, props.project.id, from, to);

    if (error) {
      console.error(error);
      setSaveState('failed');
      setError('Error changing default view');
    } else {
      setSaveState('success');

      const updated = props.installedPlugins.map(i => 
        i.plugin.name === from ? {...i, settings: { ...i.settings, provides_default_route: false }} :
        i.plugin.name === to ? {...i, settings: { ...i.settings, provides_default_route: true }} :
        i);

      props.onUpdateBehavior(updated);
    }
  }

  return pluginsProvidingDefaultRoute.length > 0 ? (
    <div className="document-behavior-container">
      <div className="document-behavior">
        <h3>Document Behavior</h3>

        <div className="default-route-selection">
          <h4>Open documents with</h4>
          <p>
            Choose which view opens when you click a document in this project. 
          </p>

          <Select.Root
            value={routeProvider ?? DEFAULT_VALUE}
            onValueChange={onValueChange}>

            <Select.Trigger className="select-trigger">
              <div>
                <Select.Value /> 
                <TinySaveIndicator state={saveState} />
              </div>
              <Select.Icon className="select-icon">
                <CaretDownIcon />
              </Select.Icon>
            </Select.Trigger>
            
            <Select.Portal>
              <Select.Content className="select-content">
                <Select.Viewport className="select-viewport">
                  <Select.Item 
                    value={DEFAULT_VALUE}
                    className="select-item">
                    <Select.ItemText>Built-in annotation views</Select.ItemText>
                    <Select.ItemIndicator className="select-item-indicator">
                      <CheckIcon />
                    </Select.ItemIndicator>
                  </Select.Item>

                  {pluginsProvidingDefaultRoute.map(installed => (
                    <Select.Item
                      key={installed.plugin.name}
                      value={installed.plugin.name}
                      className="select-item">
                      <Select.ItemText>{installed.plugin.name}</Select.ItemText>
                      <Select.ItemIndicator className="select-item-indicator">
                        <CheckIcon />
                      </Select.ItemIndicator>
                    </Select.Item>
                  ))}
                </Select.Viewport>
              </Select.Content>
            </Select.Portal>
          </Select.Root>

          {error ? (
            <p className="default-route-hint error-hint" role="alert">
              <WarningIcon /> {error}
            </p>
          ) : routeProvider !== undefined && (
            <p className="default-route-hint override-hint">
              <InfoIcon /> <span>Plugin views replace the built-in views for the document 
              types they support. Other documents still open in the built-in views.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  ) : null;

}