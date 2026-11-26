import { useMemo, useState } from 'react';
import { CaretDownIcon, CheckIcon, InfoIcon } from '@phosphor-icons/react';
import * as Select from '@radix-ui/react-select';
import type { PluginInstallationConfig } from '@recogito/studio-sdk';

import './DocumentBehavior.css';

interface DocumentBehaviorProps {
  installedPlugins: PluginInstallationConfig[];
}

// Radix Select doesn't allow empty string (would be uncontrolled mode)
const DEFAULT_VALUE = '__default__';

export const DocumentBehavior = (props: DocumentBehaviorProps) => {
  const [routeProvider, setRouteProvider] = useState<string | undefined>();

  const pluginsProvidingDefaultRoute = useMemo(() => (
    props.installedPlugins
      .filter(plugin => (plugin.plugin.extensions || [])
        .some(extension => extension.extension_point === 'project:document-default-view'))
  ), [props.installedPlugins]);

  const onValueChange = (value: string) => {
    setRouteProvider(value === DEFAULT_VALUE ? undefined : value);
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
              <Select.Value />
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

          {routeProvider !== undefined && (
            <p className="override-hint">
              <InfoIcon /> <span>Plugin views replace the built-in views for the document 
              types they support. Other documents still open in the built-in views.</span>
            </p>
          )}
        </div>
      </div>
    </div>
  ) : null;

}