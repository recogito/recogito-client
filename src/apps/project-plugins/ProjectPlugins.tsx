import { useState } from 'react';
import { Trash } from '@phosphor-icons/react';
import { deleteInstalledPlugin, updatePluginSettings } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { Extension } from '@components/Plugins';
import type { PluginMetadata, PluginInstallationConfig } from '@components/Plugins';
import { GetPlugins } from './GetPlugins';
import type { ExtendedProjectData } from 'src/Types';

import './ProjectPlugins.css';

export interface ProjectPluginsProps {

  project: ExtendedProjectData;

  availablePlugins: PluginMetadata[];

  installedPlugins: PluginInstallationConfig[];

}

export const ProjectPlugins = (props: ProjectPluginsProps) => {

  const [installedPlugins, setInstalledPlugins] = useState(props.installedPlugins);

  const onPluginInstalled = (installed: PluginInstallationConfig) =>
    setInstalledPlugins(all => [...all, installed]);

  const onPluginRemoved = (removed: PluginInstallationConfig) =>
    setInstalledPlugins(all => all.filter(i => i !== removed));

  const onError = (error?: any) => {
    // TODO toast?
    console.error('Error', error);
  }

  const onChangeUserSettings = (plugin: PluginInstallationConfig) => (settings: any) => {
    const before = [...installedPlugins];

    // Optimistic update
    const next: PluginInstallationConfig = {
      ...plugin,
      settings: {
        ...plugin.settings,
        plugin_settings: settings
      }
    };

    setInstalledPlugins(all => all.map(p => p.meta.id === plugin.meta.id ? next : p));

    updatePluginSettings(
      supabase,
      props.project.id,
      plugin.meta.id,
      settings
    ).then(({ error }) => {
      if (error) {
        onError(error);

        // Rollback
        setInstalledPlugins(before);
      }
    });
  }

  const onRemovePlugin = (installed: PluginInstallationConfig) => () => {
    const before = [...installedPlugins];

    // Optimistic update
    onPluginRemoved(installed);

    deleteInstalledPlugin(
      supabase, 
      props.project.id,
      installed.meta.id
    ).then(({ error }) => {
      if (error) {
        onError(error);

        // Rollback
        setInstalledPlugins(before);
      }
    });
  }

  return (
    <div className="project-plugins">
      <div className="browse-plugins">
        <h1>Plugins</h1>

        <p className="hint">
          Add super-powers to your annotation project with Plugins.  
        </p>

        <GetPlugins 
          project={props.project}
          availablePlugins={props.availablePlugins} 
          installedPlugins={installedPlugins} 
          onPluginInstalled={onPluginInstalled}
          onPluginRemoved={onPluginRemoved} 
          onError={onError} />
      </div>

      <div>
        <h2>Installed Plugins ({installedPlugins.length})</h2>

        {installedPlugins.map(p => (
          <section 
            key={p.meta.id} 
            className="plugin-admin-tile">

            <div className="plugin-meta">
              <h3>{p.meta.name}</h3>

              <p className="description">
                {p.meta.description}
              </p>

              <div className="uninstall">
                <button
                  className="sm flat danger"
                  onClick={onRemovePlugin(p)}>
                  <Trash size={16} /> <span>Uninstall</span>
                </button>
              </div>

              {(p.meta.author || p.meta.homepage) && (
                <p className="author">
                  Author: {(p.meta.author && p.meta.homepage) ? (
                    <a href={p.meta.homepage} target="_blank">{p.meta.author}</a>
                  ) : p.meta.homepage ? (
                    <a href={p.meta.homepage} target="_blank">{p.meta.homepage}</a>                  
                  ) : (
                    <span>{p.meta.author}</span>
                  )}
                </p>
              )}
            </div>

            <div className="plugin-admin">
              <Extension
                plugin={p}
                extensionPoint="admin"
                onChangeUserSettings={onChangeUserSettings(p)} />
            </div>
          </section>
        ))}
      </div>
    </div>
  )

}