import { useEffect, useState } from 'react';
import { supabase } from '@backend/supabaseBrowserClient';
import { deleteInstalledPlugin, insertInstalledPlugin } from '@backend/helpers';
import { Button } from '@components/Button';
import type { PluginInstallationConfig, PluginMetadata } from '@components/Plugins';
import { CheckCircle } from '@phosphor-icons/react';
import type { Project } from 'src/Types';

interface PluginGalleryItemProps {

  project: Project

  plugin: PluginMetadata;

  installed?: PluginInstallationConfig;

  onInstalled(installed: PluginInstallationConfig): void;

  onRemoved(removed: PluginInstallationConfig): void;

  onError(error?: any): void;

}

export const PluginGalleryItem = (props: PluginGalleryItemProps) => {

  const { plugin } = props;

  const [image, setImage] = useState<any>();

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    import(`../../../../plugins/${plugin.directory}/thumbnail.jpg`)
      .then(data => setImage(data.default));
  }, []);

  const onInstall = () => {
    setBusy(true);

    insertInstalledPlugin(
      supabase, 
      props.project.id,
      plugin.id,
      plugin.name
    ).then(({ error, data }) => {
      setBusy(false);
      if (data)
        props.onInstalled({ meta: props.plugin, settings: data });
      else 
        props.onError(error);
    });
  }

  const onRemove = () => {
    setBusy(true);

    deleteInstalledPlugin(
      supabase, 
      props.project.id,
      plugin.id
    ).then(({ error }) => {
      setBusy(false);
      
      if (error)
        props.onError(error)
      else 
        props.onRemoved(props.installed!);
    });
  }

  return (
    <div className="plugin-gallery-item">
      <div className="plugin-gallery-card">
        {props.installed && (
          <div className="plugin-installed">
            <CheckCircle size={16} /> Installed
          </div>
        )}

        <div className="thumbnail">
          <img src={image} />
        </div>

        <div className="description">
          <h3>{plugin.name}</h3>
          <p>
            {plugin.description}
          </p>
        </div>
      </div>

      {props.installed ? (
        <Button 
          className="remove-plugin"
          busy={busy}
          onClick={onRemove}>
          <span>Remove</span>
        </Button>
      ) : (
        <Button 
          className="install-plugin primary"
          busy={busy}
          onClick={onInstall}>
            <span>Install</span>
        </Button>
      )}
    </div>
  )

}