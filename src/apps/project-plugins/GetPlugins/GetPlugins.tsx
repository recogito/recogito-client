import { useState } from 'react';
import { PluginGallery } from './PluginGallery';
import { PuzzlePiece } from '@phosphor-icons/react';
import type { PluginInstallationConfig, PluginMetadata } from '@components/Plugins';
import type { Project } from 'src/Types';

interface GetPluginsProps {

  project: Project;

  availablePlugins: PluginMetadata[];

  installedPlugins: PluginInstallationConfig[];

  onPluginInstalled(installed: PluginInstallationConfig): void;

  onPluginRemoved(removed: PluginInstallationConfig): void;

  onError(error?: any): void;

}


export const GetPlugins = (props: GetPluginsProps) => {

  const [showGallery, setShowGallery] = useState(false);

  return (
    <>
      <button className="primary" onClick={() => setShowGallery(true)}>
        <PuzzlePiece size={20} />
        <span>Browse Available Plugins</span>
      </button>

      {showGallery && (
        <PluginGallery 
          project={props.project}
          availablePlugins={props.availablePlugins}
          installedPlugins={props.installedPlugins}
          onClose={() => setShowGallery(false)} 
          onPluginInstalled={props.onPluginInstalled}
          onPluginRemoved={props.onPluginRemoved}
          onError={props.onError} />
      )}
    </>
  )

}