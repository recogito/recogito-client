import { useState } from 'react';
import { TrashIcon } from '@phosphor-icons/react';
import type { Plugin, PluginInstallationConfig } from '@recogito/studio-sdk';
import { deleteInstalledPlugin, updatePluginSettings } from '@backend/helpers';
import { supabase } from '@backend/supabaseBrowserClient';
import { ExtensionMount } from '@components/Plugins';
import type { ExtendedProjectData } from 'src/Types';
import { GetPlugins } from './GetPlugins';
import { DocumentBehavior } from './DocumentBehavior';

interface PluginSettingsProps {
  project: ExtendedProjectData;

  availablePlugins: Plugin[];

  installedPlugins: PluginInstallationConfig[];

  onError(message: string): void;
}

export const PluginSettings = (props: PluginSettingsProps) => {

  const [installedPlugins, setInstalledPlugins] = useState(
    props.installedPlugins
  );

  const onPluginInstalled = (installed: PluginInstallationConfig) =>
    setInstalledPlugins(all => [...all, installed]);

  const onPluginRemoved = (removed: PluginInstallationConfig) =>
    setInstalledPlugins(all => all.filter((i) => i !== removed));

  const onRemovePlugin = (installed: PluginInstallationConfig) => () => {
    const before = [...installedPlugins];

    // Optimistic update
    onPluginRemoved(installed);

    deleteInstalledPlugin(
      supabase,
      props.project.id,
      installed.plugin.name
    ).then(({ error }) => {
      if (error) {
        props.onError(error.message);

        // Rollback
        setInstalledPlugins(before);
      }
    });
  };

  const onChangeUserSettings = (
    installed: PluginInstallationConfig
  ) => (settings: any) => {
    const before = [...installedPlugins];

    // Optimistic update
    const next: PluginInstallationConfig = {
      ...installed,
      settings: {
        ...installed.settings,
        plugin_settings: settings,
      },
    };

    setInstalledPlugins((all) =>
      all.map((i) => (i.plugin.name === installed.plugin.name ? next : i))
    );

    updatePluginSettings(
      supabase,
      props.project.id,
      installed.plugin.name,
      settings
    ).then(({ error }) => {
      if (error) {
        props.onError(error.message);

        // Rollback
        setInstalledPlugins(before);
      }
    });
  };

  const renderAdminExtension = (config: PluginInstallationConfig) => {
    const e = (config.plugin.extensions || []).find(
      (e) => e.extension_point === 'admin'
    );

    return e ? (
      <div className='plugin-admin'>
        <ExtensionMount
          extension={e}
          pluginConfig={config}
          onChangeUserSettings={onChangeUserSettings(config)}
        />
      </div>
    ) : null;
  };

  return (
    <div className='project-plugins tab-container'>
      <div className='project-plugins-header'>
        <h2>Plugins</h2>

        <div className='browse-available-plugins'>
          <p className='hint'>
            Add super-powers to your annotation project with Plugins.
          </p>

          <GetPlugins
            project={props.project}
            availablePlugins={props.availablePlugins}
            installedPlugins={installedPlugins}
            onPluginInstalled={onPluginInstalled}
            onPluginRemoved={onPluginRemoved}
            onError={props.onError}
          />
        </div>

        <DocumentBehavior 
          installedPlugins={installedPlugins} />
      </div>

      <div className='installed-plugins'>
        <h3>Installed Plugins ({installedPlugins.length})</h3>

        {installedPlugins.map((i) => (
          <section key={i.plugin.name} className='plugin-admin-tile'>
            <div className='plugin-meta'>
              <h3>
                {i.plugin.name}
                {i.settings.provides_default_route && (
                  <span className="default-view-badge">Default View</span>
                )}
              </h3>

              <p className='description'>{i.plugin.description}</p>

              <div className='uninstall'>
                <button
                  className='sm flat danger'
                  onClick={onRemovePlugin(i)}
                >
                  <TrashIcon size={16} /> <span>Uninstall</span>
                </button>
              </div>

              {(i.plugin.author || i.plugin.homepage) && (
                <p className='author'>
                  Author:{' '}
                  {i.plugin.author && i.plugin.homepage ? (
                    <a
                      href={i.plugin.homepage}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {i.plugin.author}
                    </a>
                  ) : i.plugin.homepage ? (
                    <a
                      href={i.plugin.homepage}
                      target='_blank'
                      rel='noreferrer'
                    >
                      {i.plugin.homepage}
                    </a>
                  ) : (
                    <span>{i.plugin.author}</span>
                  )}
                </p>
              )}
            </div>

            {renderAdminExtension(i)}
          </section>
        ))}
      </div>
    </div>
  )

}