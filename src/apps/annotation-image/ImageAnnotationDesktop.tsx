import { useMemo, useState } from 'react';
import type { Document, Layer, Translations } from 'src/Types';
import { Annotation } from '@components/Annotation';
import { Toolbar } from './Toolbar';
import { createAppearenceProvider, PresenceStack } from '@components/Presence';
import type { PrivacyMode } from '@components/PrivacySelector';
import {
  Annotorious, 
  OpenSeadragonAnnotator,
  OpenSeadragonPopup,
  OpenSeadragonViewer,
  PresentUser,
  SupabasePlugin
} from '@annotorious/react';

import './ImageAnnotationDesktop.css';

const SUPABASE: string = import.meta.env.PUBLIC_SUPABASE;

const SUPABASE_API_KEY: string = import.meta.env.PUBLIC_SUPABASE_API_KEY;

export interface ImageAnnotationDesktopProps {

  i18n: Translations;

  document: Document;

  layers: Layer[];

  channelId: string;

}

export const ImageAnnotationDesktop = (props: ImageAnnotationDesktopProps) => {

  const { i18n } = props;

  const [present, setPresent] = useState<PresentUser[]>([]);

  const [tool, setTool] = useState<string | null>(null);

  const [privacy, setPrivacy] = useState<PrivacyMode>('PUBLIC');

  const appearance = useMemo(() => createAppearenceProvider(), []);

  const onConnectError = () =>
    window.location.href = `/${props.i18n.lang}/sign-in`;

  return (
    <div className="anno-desktop ia-desktop">
      <Annotorious>
        <OpenSeadragonAnnotator tool={tool} keepEnabled={true}>
          <SupabasePlugin
            base={SUPABASE}
            apiKey={SUPABASE_API_KEY} 
            channel={props.channelId}
            layerId={props.layers[0].id} 
            appearanceProvider={appearance}
            onPresence={setPresent} 
            onConnectError={onConnectError}
            privacyMode={privacy === 'PRIVATE'} />

          <OpenSeadragonViewer
            className="ia-osd-container"
            options={{
              tileSources: props.document.meta_data?.url,
              gestureSettingsMouse: {
                clickToZoom: false
              }, 
              showNavigationControl: false
            }} />

          <OpenSeadragonPopup
            popup ={props => (
              <Annotation.Popup 
                {...props} 
                present={present} 
                i18n={i18n} /> )} />

          <div className="anno-desktop-right">
            <PresenceStack present={present} />
          </div>

          <div className="anno-desktop-bottom">
            <Toolbar 
              i18n={props.i18n}
              privacy={privacy}
              onChangeTool={setTool} 
              onChangePrivacy={setPrivacy} />
          </div>
        </OpenSeadragonAnnotator>
      </Annotorious>
    </div>
  )

}