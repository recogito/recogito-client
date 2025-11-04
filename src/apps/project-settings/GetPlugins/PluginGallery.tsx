import * as Dialog from '@radix-ui/react-dialog';
import type { Plugin, PluginInstallationConfig } from '@recogito/studio-sdk';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { PluginGalleryItem } from './PluginGalleryItem';
import type { Project, Translations } from 'src/Types';
import { DialogContent } from '@components/DialogContent';

import './PluginGallery.css';

interface PluginGalleryProps {

  i18n: Translations;

  project: Project;

  availablePlugins: Plugin[];

  installedPlugins: PluginInstallationConfig[];

  onClose(): void;

  onPluginInstalled(plugin: PluginInstallationConfig): void;

  onPluginRemoved(plugin: PluginInstallationConfig): void; 

  onError(error?: any): void;

}

export const PluginGallery = (props: PluginGalleryProps) => {
  const { t } = props.i18n;

  const getInstalled = (plugin: Plugin) => 
    props.installedPlugins.find(i => i.plugin.name === plugin.name);

  return (
    <Dialog.Root open={true} onOpenChange={props.onClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="dialog-overlay" />

        <DialogContent 
          className="dialog-content plugin-gallery">

          <Dialog.Title asChild>
            <h2>{t['Available Plugins']}</h2>
          </Dialog.Title>

          <VisuallyHidden>
            <Dialog.Description>
              {t['Available Plugins']}
            </Dialog.Description>
          </VisuallyHidden>
          
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
        </DialogContent>
      </Dialog.Portal>
    </Dialog.Root>
  )

}