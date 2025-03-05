import { useState } from 'react';
import type { Plugin, PluginInstallationConfig } from '@recogito/studio-sdk';
import { PuzzlePiece } from '@phosphor-icons/react';
import { PluginGallery } from './PluginGallery';
import type { Project } from 'src/Types';

interface GetPluginsProps {

  project: Project;

  availablePlugins: Plugin[];

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