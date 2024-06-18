import type { PluginInstallationConfig, PluginMetadata } from '@components/Plugins';
import * as Dialog from '@radix-ui/react-dialog';
import { PluginGalleryItem } from './PluginGalleryItem';
import type { Project } from 'src/Types';

import './PluginGallery.css';

interface PluginGalleryProps {

  project: Project;

  availablePlugins: PluginMetadata[];

  installedPlugins: PluginInstallationConfig[];

  onClose(): void;

  onPluginInstalled(plugin: PluginInstallationConfig): void;

  onPluginRemoved(plugin: PluginInstallationConfig): void; 

  onError(error?: any): void;

}

export const PluginGallery = (props: PluginGalleryProps) => {

  const getInstalled = (meta: PluginMetadata) => 
    props.installedPlugins.find(p => p.meta.id === meta.id);

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <Dialog.Content 
          className="dialog-content plugin-gallery">

          <h2>Available Plugins</h2>
          
          <ul className="plugin-grid">
            {props.availablePlugins.map(plugin => (
              <li key={plugin.name}>
                <PluginGalleryItem 
                  project={props.project}
                  installed={getInstalled(plugin)}
                  plugin={plugin}
                  onInstalled={props.onPluginInstalled}
                  onRemoved={props.onPluginRemoved} 
                  onError={props.onError} />
              </li>
            ))}
          </ul>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )

}